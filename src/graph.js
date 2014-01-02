//global parameters
var hp = hp||{"ID_counter":0,"events":{"resize":[]}}

hp.graph = HP_graph;



/**
 * Create and draw a new graph.
 * 
 * Arguments:
 *   containerId => id of container to insert SVG. [REQUIRED]
 *	 size => graph size settings [OPTIONAL]
 *   	width => the width of the svg canvas. Default:960 [OPTIONAL]
 *   	height => the height of the svg canvas. Default:500 [OPTIONAL]
 *   	auto => automatically adjust the size based on the container size. Default:false [OPTIONAL]
 */
function HP_graph(containerID,size){
	var graph = {}

	function init(){
		graph.svgID = hp.ID_counter += 1;

		//set the Default values
		graph.width = 960;
		graph.height = 500;
		graph.margin = {top:0,bottom:0,left:0,right:0};
		graph.auto = false;
		graph.scale = 1;
		parseArgs();
		createGraph();
	}	

	function parseArgs(){
		graph.containerID = containerID;
		if(size){
			if(size.width) graph.width = size.width;
			if(size.height) graph.height = size.height;
			if(size.auto) graph.auto = size.auto;
		}
	}

	function createGraph(){
		var width = graph.width,
			height = graph.height


		d3.select("#"+graph.containerID)
			.append("svg")
			.attr("width",width)
			.attr("height",height)
			.attr("id","svg_"+graph.svgID);


		graph.container = selectContainer;
		graph.svg = selectSvg;
		graph.exit = exit;
		graph.hide = hide;
		graph.show = show;
		graph.fade = fade;

		register_resize();
		show();
	}

	function selectContainer(){
		return d3.select("#"+graph.containerID)
	}
	function selectSvg(){
		return graph.container().select("#svg_"+graph.svgID)
	}
	function hide(animation){
		selectSvg().transition().duration(500).attr("opacity",0)
	}
	function show(){
		selectSvg().transition().duration(500).attr("opacity",1)
	}
	function fade(para){
		selectSvg().transition().duration(500).attr("opacity",para)
	}
	function exit(){
		selectSvg().remove()
	}

	function register_resize(){
		if(graph.auto){
			resize();
			window.addEventListener("resize",resize);
		};
	}

	function resize(){
		var current_width = parseInt(d3.select("#"+graph.containerID).style('width'));
		graph.scale = current_width/graph.width;
		graph.svg().attr("width",graph.width*graph.scale).attr("height",graph.height*graph.scale)
	}

	function args_check(){
		return containerID?true:false;
	}

	if(args_check()) init();
	return graph;
}