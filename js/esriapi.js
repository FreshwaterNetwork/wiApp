define([
	"esri/layers/ArcGISDynamicMapServiceLayer", "esri/geometry/Extent", "esri/SpatialReference", "esri/tasks/query" ,"esri/tasks/QueryTask", "dojo/_base/declare", "esri/layers/FeatureLayer", 
	"esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleFillSymbol","esri/symbols/SimpleMarkerSymbol", "esri/graphic", "dojo/_base/Color"
],
function ( 	ArcGISDynamicMapServiceLayer, Extent, SpatialReference, Query, QueryTask, declare, FeatureLayer, 
			SimpleLineSymbol, SimpleFillSymbol, SimpleMarkerSymbol, Graphic, Color ) {
        "use strict";

        return declare(null, {
			esriApiFunctions: function(t){	
				// zoom to tracker
				t.zoomTo = 'no'
				// Add dynamic map service
				t.dynamicLayer = new ArcGISDynamicMapServiceLayer(t.url, {opacity:0.7});
				t.map.addLayer(t.dynamicLayer);
				if (t.obj.visibleLayers.length > 0){	
					t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
				}
				t.dynamicLayer.on("load", function () { 			
					t.layersArray = t.dynamicLayer.layerInfos;
					t.map.setExtent(t.dynamicLayer.fullExtent.expand(0.6), true)
					// trigger initial top control clicks
					$.each($('#' + t.id + 'top-controls input'),function(i,v){
						if (t.obj[v.name] == v.value){
							$('#' + v.id).trigger('click');	
						}	
					});

					// Save and Share Handler					
					if (t.obj.stateSet == "yes"){
						//extent
						var extent = new Extent(t.obj.extent.xmin, t.obj.extent.ymin, t.obj.extent.xmax, t.obj.extent.ymax, new SpatialReference({ wkid:4326 }))
						t.map.setExtent(extent, true);
						// accordion visibility
						// $('#' + t.id + t.obj.accordVisible).show();
						// $('#' + t.id + t.obj.accordHidden).hide();
						// $('#' + t.id + 'getHelpBtn').html(t.obj.buttonText);
						// //t.clicks.updateAccord(t);
						// $('#' + t.id + t.obj.accordVisible).accordion( "option", "active", t.obj.accordActive );	
						t.obj.stateSet = "no";
					}	
					t.map.setMapCursor("pointer");
				});					
			}
		});
    }
);