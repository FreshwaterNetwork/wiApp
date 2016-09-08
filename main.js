// Pull in your favorite version of jquery 
require({ 
	packages: [{ name: "jquery", location: "http://ajax.googleapis.com/ajax/libs/jquery/2.1.0/", main: "jquery.min" }] 
});
// Bring in dojo and javascript api classes as well as varObject.json, js files, and content.html
define([
	"dojo/_base/declare", "framework/PluginBase", "dijit/layout/ContentPane", "dojo/dom", "dojo/dom-style", "dojo/dom-geometry", "dojo/_base/lang", "dojo/text!./obj.json", 
	"jquery", "dojo/text!./html/content.html", './js/jquery-ui-1.11.2/jquery-ui', './js/navigation', './js/esriapi', './js/clicks', './js/stateCh'
],
function ( 	declare, PluginBase, ContentPane, dom, domStyle, domGeom, lang, obj, 
			$, content, ui, navigation, esriapi, clicks, stateCh ) {
	return declare(PluginBase, {
		// The height and width are set here when an infographic is defined. When the user click Continue it rebuilds the app window with whatever you put in.
		toolbarName: "Coastline Change", showServiceLayersInLegend: true, allowIdentifyWhenActive: false, rendered: false, resizable: false,
		hasCustomPrint: true, usePrintPreviewMap: true, previewMapSize: [1000, 550], height:"600", width:"420",
		// First function called when the user clicks the pluging icon. 
		initialize: function (frameworkParameters) {
			
			// Access framework parameters
			declare.safeMixin(this, frameworkParameters);
			// Set initial app size based on split screen state
			this.con = dom.byId('plugins/coastline-change-0');
			this.con1 = dom.byId('plugins/coastline-change-1');
			if (this.con1 != undefined){
				domStyle.set(this.con1, "width", "420px");
				domStyle.set(this.con1, "height", "600px");
			}else{
				domStyle.set(this.con, "width", "420px");
				domStyle.set(this.con, "height", "600px");
			}	
			// Define object to access global variables from JSON object. Only add variables to varObject.json that are needed by Save and Share. 
			this.obj = dojo.eval("[" + obj + "]")[0];	
			this.url = "http://dev.services2.coastalresilience.org:6080/arcgis/rest/services/Virginia/coastline_change_historic/MapServer";
			this.layerDefs = [];
		},
		// Called after initialize at plugin startup (why all the tests for undefined). Also called after deactivate when user closes app by clicking X. 
		hibernate: function () {
			this.map.__proto__._params.maxZoom = 23;
			if (this.appDiv != undefined){
				$('#' + this.id + 'ch-ISL').val('').trigger('chosen:updated');
				$('#' + this.id + 'ch-ISL').trigger('change');
			}
		},
		// Called after hibernate at app startup. Calls the render function which builds the plugins elements and functions.   
		activate: function () {
			this.map.__proto__._params.maxZoom = 19;
			
			if (this.rendered == false) {
				this.rendered = true;							
				this.render();
				// Hide the print button until a hex has been selected
				$(this.printButton).hide();
				this.dynamicLayer.setVisibility(true);
			} 
		},
		// Called when user hits the minimize '_' icon on the pluging. Also called before hibernate when users closes app by clicking 'X'.
		deactivate: function () {
		},	
		// Called when user hits 'Save and Share' button. This creates the url that builds the app at a given state using JSON. 
		// Write anything to you varObject.json file you have tracked during user activity.		
		getState: function () {
			this.obj.extent = this.map.geographicExtent;
			this.obj.activeAcIndex = $('#' + this.id + 'dlAccord').accordion( "option", "active" );
			this.obj.activeAc1Index = $('#' + this.id + 'dlAccord1').accordion( "option", "active" );
			var c = $('#' + this.id + 'printAnchorDiv').children()
			$.each(c,lang.hitch(this,function(i,v){
				if ( $(v).hasClass('zoomSelected') ){
					this.obj.pinHighlighted = i;	
				}	
			}));
			this.obj.stateSet = "yes";	
			var state = new Object();
			state = this.obj;
			return state;	
		},
		
		// Called before activate only when plugin is started from a getState url. 
		//It's overwrites the default JSON definfed in initialize with the saved stae JSON.
		setState: function (state) {
			this.obj = state;
			this.pinSelArray = this.obj.pinSelArray;
			this.searchedPin = this.obj.searchedPin;
			this.futObid = this.obj.futObid;
			this.queryVis = this.obj.queryVis;
			this.stateSet = this.obj.stateSet;
		},
		// Called when the user hits the print icon
		beforePrint: function(printDeferred, $printArea, mapObject) {
			printDeferred.resolve();
		},	
		// Resizes the plugin after a manual or programmatic plugin resize so the button pane on the bottom stays on the bottom.
		// Tweak the numbers subtracted in the if and else statements to alter the size if it's not looking good.
		resize1: function(w, h) {
			cdg = domGeom.position(this.container);
			if (cdg.h == 0) { this.sph = this.height - 80; }
			else { this.sph = cdg.h - 62; }
			domStyle.set(this.appDiv.domNode, "height", this.sph + "px"); 
		},
		// Called by activate and builds the plugins elements and functions
		render: function() {
			
			
			
			
			
			
			
			
			
			
			//this.map.setBasemap("dark-gray");
			// BRING IN OTHER JS FILES
			this.navigation = new navigation();
			this.esriapi = new esriapi();
			this.clicks = new clicks();
			this.stateCh = new stateCh();
			// ADD HTML TO APP
			// Define Content Pane as HTML parent		
			this.appDiv = new ContentPane({style:'padding:8px 8px 8px 8px'});
			this.id = this.appDiv.id
			dom.byId(this.container).appendChild(this.appDiv.domNode);					
			// Get html from content.html, prepend appDiv.id to html element id's, and add to appDiv
			var idUpdate = content.replace(/id='/g, "id='" + this.id);	
			$('#' + this.id).html(idUpdate);
			// resize the container in the render function after the container is built.
			this.resize1();
			// CREATE ACCORDIANS
			$('#' + this.id + 'dlAccord').accordion({ collapsible: true, active: 0, heightStyle: "content" });
			$('#' + this.id + 'dlAccord1').accordion({ collapsible: true, active: 0, heightStyle: "content" });
			//create slider bar
			$('#' + this.id + 'multiShoreSlider').slider({ min: 0,	max: 13, value: 0, step: 1 });
			$('#' + this.id + 'seaLevelSlider').slider({ min: 0, max: 2, value: 0, step: 1 });
			$('#' + this.id + 'waveSlider').slider({ min: 0, max: 2, value: 0, step: 1 });
			$('#' + this.id + 'nourSlider').slider({ min: 0, max: 3, value: 0, step: 1 });
			
			this.obj.initialExtent = this.map.extent;
			
			
			// CALL NAVIGATION BUTTON EVENT LISTENERS 
			this.navigation.navListeners(this);
			//Call the function to populate the initial graph
			this.esriapi.esriStartUp(this);
			// CREATE ESRI OBJECTS AND EVENT LISTENERS	
			this.esriapi.esriApiFunctions(this);
			// CREATE CHOSEN SELECT MENUS AND EVENT LISTENERS	
			this.clicks.chosenListeners(this);				
			// EVENT LISTENER FOR MAP PREVIEW AND DOWNLOAD
			//this.clicks.mapPreviewDownload(this);	
			// EXPAND AND COLLAPSE INFO IN ELEMENTS SUMMARY
			//this.clicks.toggleInfoSum(this);
			// UPDATE STATE IF SET STATE WAS CALLED
			//this.stateCh.checkState(this);
			
			this.rendered = true;	
		},
	});
});