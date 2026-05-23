/*!
 * Image (upload) dialog plugin for Editor.md
 *
 * @file        image-dialog.js
 * @author      pandao
 * @version     1.3.4
 * @updateTime  2015-06-09
 * {@link       https://github.com/pandao/editor.md}
 * @license     MIT
 */

(function() {

    var factory = function (exports) {

		var pluginName   = "image-dialog";

		exports.fn.imageDialog = function() {

            var _this       = this;
            var cm          = this.cm;
            var lang        = this.lang;
            var editor      = this.editor;
            var settings    = this.settings;
            var cursor      = cm.getCursor();
            var selection   = cm.getSelection();
            var imageLang   = lang.dialog.image;
            var classPrefix = this.classPrefix;
            var iframeName  = classPrefix + "image-iframe";
			var dialogName  = classPrefix + pluginName, dialog;

			cm.focus();

            var loading = function(show) {
                var _loading = dialog.find("." + classPrefix + "dialog-mask");
                _loading[(show) ? "show" : "hide"]();
            };

            var trim = function(value) {
                return String(value || "").replace(/^\s+|\s+$/g, "");
            };

            var showToast = function(message, type) {
                var toast = window.__EDITOR_MD_TOAST__;

                if (typeof toast === "function")
                {
                    toast(message, type || "warning");
                    return;
                }

                alert(message);
            };

            var shouldSaveRemoteImage = function(url) {
                return /^(https?:)?\/\//i.test(url);
            };

            var insertImageMarkdown = function(url, alt, link) {
                var altAttr = (alt !== "") ? " \"" + alt + "\"" : "";

                if (link === "" || link === "http://")
                {
                    cm.replaceSelection("![" + alt + "](" + url + altAttr + ")");
                }
                else
                {
                    cm.replaceSelection("[![" + alt + "](" + url + altAttr + ")](" + link + altAttr + ")");
                }

                if (alt === "") {
                    cm.setCursor(cursor.line, cursor.ch + 2);
                }
            };

            var handleRemoteImageSave = function(url, done, fail) {
                var saveImage = window.__EDITOR_MD_SAVE_IMAGE__;

                if (typeof saveImage !== "function")
                {
                    fail("图片转存能力未就绪，请刷新页面后重试");
                    return;
                }

                saveImage(url).then(function(imagePath) {
                    done(imagePath);
                }).catch(function(error) {
                    fail((error && error.message) ? error.message : "图片转存失败");
                });
            };

            if (editor.find("." + dialogName).length < 1)
            {
                var guid   = (new Date).getTime();
                var action = settings.imageUploadURL + (settings.imageUploadURL.indexOf("?") >= 0 ? "&" : "?") + "guid=" + guid;

                if (settings.crossDomainUpload)
                {
                    action += "&callback=" + settings.uploadCallbackURL + "&dialog_id=editormd-image-dialog-" + guid;
                }

                var dialogContent = ( (settings.imageUpload) ? "<form action=\"" + action +"\" target=\"" + iframeName + "\" method=\"post\" enctype=\"multipart/form-data\" class=\"" + classPrefix + "form\">" : "<div class=\"" + classPrefix + "form\">" ) +
                                        ( (settings.imageUpload) ? "<iframe name=\"" + iframeName + "\" id=\"" + iframeName + "\" guid=\"" + guid + "\"></iframe>" : "" ) +
                                        "<label>" + imageLang.url + "</label>" +
                                        "<input type=\"text\" data-url />" + (function(){
                                            return (settings.imageUpload) ? "<div class=\"" + classPrefix + "file-input\">" +
                                                                                "<input type=\"file\" name=\"image\" accept=\"image/*\" />" +
                                                                                "<input type=\"submit\" value=\"" + imageLang.uploadButton + "\" />" +
                                                                            "</div>" : "";
                                        })() +
                                        "<br/>" +
                                        "<label>" + imageLang.alt + "</label>" +
                                        "<input type=\"text\" value=\"" + selection + "\" data-alt />" +
                                        "<br/>" +
                                        "<label>" + imageLang.link + "</label>" +
                                        "<input type=\"text\" value=\"http://\" data-link />" +
                                        "<br/>" +
                                    ( (settings.imageUpload) ? "</form>" : "</div>");

                //var imageFooterHTML = "<button class=\"" + classPrefix + "btn " + classPrefix + "image-manager-btn\" style=\"float:left;\">" + imageLang.managerButton + "</button>";

                dialog = this.createDialog({
                    title      : imageLang.title,
                    width      : (settings.imageUpload) ? 465 : 380,
                    height     : 254,
                    name       : dialogName,
                    content    : dialogContent,
                    mask       : settings.dialogShowMask,
                    drag       : settings.dialogDraggable,
                    lockScreen : settings.dialogLockScreen,
                    maskStyle  : {
                        opacity         : settings.dialogMaskOpacity,
                        backgroundColor : settings.dialogMaskBgColor
                    },
                    buttons : {
                        enter : [lang.buttons.enter, function() {
                            var _dialog = this;
                            var url  = trim(this.find("[data-url]").val());
                            var alt  = trim(this.find("[data-alt]").val());
                            var link = trim(this.find("[data-link]").val());

                            if (url === "")
                            {
                                showToast(imageLang.imageURLEmpty, "warning");
                                return false;
                            }

                            var finishInsert = function(finalUrl) {
                                insertImageMarkdown(finalUrl, alt, link);
                                _dialog.hide().lockScreen(false).hideMask();
                            };

                            if (shouldSaveRemoteImage(url))
                            {
                                loading(true);

                                handleRemoteImageSave(url, function(savedUrl) {
                                    loading(false);
                                    finishInsert(savedUrl);
                                }, function(message) {
                                    loading(false);
                                    showToast(message, "error");
                                });

                                return false;
                            }

                            finishInsert(url);

                            return false;
                        }],

                        cancel : [lang.buttons.cancel, function() {
                            this.hide().lockScreen(false).hideMask();

                            return false;
                        }]
                    }
                });

                dialog.attr("id", classPrefix + "image-dialog-" + guid);

				if (!settings.imageUpload) {
                    return ;
                }

				var fileInput  = dialog.find("[name=\"image\"]");

                fileInput.bind("change", function() {
					var fileName  = fileInput.val();
					var isImage   = new RegExp("(\\.(" + settings.imageFormats.join("|") + "))$"); // /(\.(webp|jpg|jpeg|gif|bmp|png))$/

					if (fileName === "")
					{
						showToast(imageLang.uploadFileEmpty, "warning");
                        
                        return false;
					}
					
                    if (!isImage.test(fileName))
					{
						showToast(imageLang.formatNotAllowed + settings.imageFormats.join(", "), "warning");
                        
                        return false;
					}

                    loading(true);

                    var submitHandler = function() {

                        var uploadIframe = document.getElementById(iframeName);

                        uploadIframe.onload = function() {
                            
                            loading(false);

                            var body = (uploadIframe.contentWindow ? uploadIframe.contentWindow : uploadIframe.contentDocument).document.body;
                            var json = (body.innerText) ? body.innerText : ( (body.textContent) ? body.textContent : null);

                            json = (typeof JSON.parse !== "undefined") ? JSON.parse(json) : eval("(" + json + ")");

                            var uploadSuccess = json.success === 1;
                            var uploadUrl = json.url;
                            var uploadMessage = json.message;

                            if (!uploadSuccess && json.status && json.status.code === 0 && json.result && json.result.imagePath)
                            {
                                uploadSuccess = true;
                                uploadUrl = json.result.imagePath;
                            }

                            if (!uploadMessage && json.status && json.status.msg)
                            {
                                uploadMessage = json.status.msg;
                            }

                            if (uploadSuccess && uploadUrl)
                            {
                                dialog.find("[data-url]").val(uploadUrl);
                            }
                            else
                            {
                                showToast(uploadMessage || "上传失败", "error");
                            }

                            return false;
                        };
                    };

                    dialog.find("[type=\"submit\"]").off("click").on("click", submitHandler).trigger("click");
				});
            }

			dialog = editor.find("." + dialogName);
			dialog.find("[type=\"text\"]").val("");
			dialog.find("[type=\"file\"]").val("");
			dialog.find("[data-link]").val("http://");

			this.dialogShowMask(dialog);
			this.dialogLockScreen();
			dialog.show();

		};

	};

	// CommonJS/Node.js
	if (typeof require === "function" && typeof exports === "object" && typeof module === "object")
    {
        module.exports = factory;
    }
	else if (typeof define === "function")  // AMD/CMD/Sea.js
    {
		if (define.amd) { // for Require.js

			define(["editormd"], function(editormd) {
                factory(editormd);
            });

		} else { // for Sea.js
			define(function(require) {
                var editormd = require("./../../editormd");
                factory(editormd);
            });
		}
	}
	else
	{
        factory(window.editormd);
	}

})();
