/**
 * elFinder client options and main script for RequireJS
 *
 * Rename "main.default.js" to "main.js" and edit it if you need configure elFInder options or any things. And use that in elfinder.html.
 * e.g. `<script data-main="./main.js" src="./require.js"></script>`
 **/
function getSiteDomain(){
    return window.location.protocol+"//"+window.location.host+window.location.pathname.replace("index.php/", "").replace("admin/filemanager", "");
}
(function(){
	"use strict";
	var // jQuery and jQueryUI version
		jqver = '3.3.1',
		uiver = '1.12.1',
		
		// Detect language (optional)
		lang = (function() {
			var locq = window.location.search,
				fullLang, locm, lang;
			if (locq && (locm = locq.match(/lang=([a-zA-Z_-]+)/))) {
				// detection by url query (?lang=xx)
				fullLang = locm[1];
			} else {
				// detection by browser language
				fullLang = (navigator.browserLanguage || navigator.language || navigator.userLanguage);
			}
			lang = fullLang.substr(0,2);
			if (lang === 'pt') lang = 'pt_BR';
			else if (lang === 'ug') lang = 'ug_CN';
			else if (lang === 'zh') lang = (fullLang.substr(0,5).toLowerCase() === 'zh-tw')? 'zh_TW' : 'zh_CN';
			return lang;
		})(),
		
		// Start elFinder (REQUIRED)
		start = function(elFinder, editors, config) {
			// load jQueryUI CSS
			elFinder.prototype.loadCss('//cdnjs.cloudflare.com/ajax/libs/jqueryui/'+uiver+'/themes/smoothness/jquery-ui.css');
			
			$(function() {
				var optEditors = {
						commandsOptions: {
							edit: {
								editors: Array.isArray(editors)? editors : []
							}
						}
					},
					opts = {};
				
				// Interpretation of "elFinderConfig"
				if (config && config.managers) {
					$.each(config.managers, function(id, mOpts) {
						opts = Object.assign(opts, config.defaultOpts || {});
						// editors marges to opts.commandOptions.edit
						try {
							mOpts.commandsOptions.edit.editors = mOpts.commandsOptions.edit.editors.concat(editors || []);
						} catch(e) {
							Object.assign(mOpts, optEditors);
						}
						// Make elFinder
						$('#' + id).elfinder(
							// 1st Arg - options
							$.extend(true, { lang: lang }, opts, mOpts || {}),
							// 2nd Arg - before boot up function
							function(fm, extraObj) {
								// `init` event callback function
								fm.bind('init', function() {
									// Optional for Japanese decoder "encoding-japanese"
									if (fm.lang === 'ja') {
										require(
											[ 'encoding-japanese' ],
											function(Encoding) {
												if (Encoding && Encoding.convert) {
													fm.registRawStringDecoder(function(s) {
														return Encoding.convert(s, {to:'UNICODE',type:'string'});
													});
												}
											}
										);
									}
								});
							}
						);
					});
				} else {
					alert('"elFinderConfig" object is wrong.');
				}
			});
		},
		
		// JavaScript loader (REQUIRED)
		load = function() {
			require(
				[
					'elfinder'
					, 'extras/editors.default.min'               // load text, image editors
					, 'elFinderConfig'
				//	, 'extras/quicklook.googledocs.min'          // optional preview for GoogleApps contents on the GoogleDrive volume
				],
				start,
				function(error) {
					alert(error.message);
				}
			);
		},
		
		// is IE8 or :? for determine the jQuery version to use (optional)
		old = (typeof window.addEventListener === 'undefined' && typeof document.getElementsByClassName === 'undefined')
		       ||
		      (!window.chrome && !document.unqueID && !window.opera && !window.sidebar && 'WebkitAppearance' in document.documentElement.style && document.body.style && typeof document.body.style.webkitFilter === 'undefined');

	// config of RequireJS (REQUIRED)
	require.config({
		baseUrl : getSiteDomain() + 'assets/js/plugins/elfinder/js',
		paths : {
			'jquery'   : '//cdnjs.cloudflare.com/ajax/libs/jquery/'+(old? '1.12.4' : jqver)+'/jquery.min',
			'jquery-ui': '//cdnjs.cloudflare.com/ajax/libs/jqueryui/'+uiver+'/jquery-ui.min',
			'elfinder' : 'elfinder.min',
			'encoding-japanese': '//cdn.rawgit.com/polygonplanet/encoding.js/1.0.26/encoding.min'
		},
		waitSeconds : 10 // optional
	});

	// load JavaScripts (REQUIRED)
	load();

})();