//global parameters
var hp = hp||{"ID_counter":0,"events":{"resize":[]}}

hp.chart = HP_chart;

/**
 * Create and draw a new graph.
 * 
 * Arguments:
 *	 containerID => containerID;
 *	 size =>
 *   	width => the width of the svg canvas. Default:960 [OPTIONAL]
 *   	height => the height of the svg canvas. Default:500 [OPTIONAL] 	
 *   	auto => automatically adjust the size based on the container size. Default:false [OPTIONAL]
 *      margin => a dictionary containing the margin infomation. [OPTIONAL]
 *      	top => default:100
 *      	bottom => default:100
 *      	left => default:100
 *      	right => default:100
 *   axis =>
 *      xtype =>
 *		ytype =>
 *          
 */
function HP_chart(containerID,size,axistype){
	var chart = {}
	var xtype,ytype;

	function init(){
		chart = hp.graph(containerID,size)
		chart.margin = {top:100,bottom:100,left:100,right:100};
		chart.xscale = d3.scale.linear();
		chart.yscale = d3.scale.linear();

		parseArgs();
		createGraph();
		console.log(chart)
	}	
	function scaletype(type){
		switch(type){
			case "linear":
				return d3.scale.linear();
			case "ordinal":
				return d3.scale.ordinal();
			case "identity":
				return d3.scale.identity();
			case "sqrt":
				return d3.scale.sqrt();
			case "pow":
				return d3.scale.pow();
			case "log":
				return d3.scale.log();
			case "quantize":
				return d3.scale.quantize();
			case "quantile":
				return d3.scale.quantile();
			case "threshold":
				return d3.scale.threshold();
			default:
				return d3.scale.linear();
		}
	}
	function parseArgs(){
		if(size) chart.margin = size.margin?size.margin:chart.margin;
		if(axistype){
			if(axistype.x)	chart.xscale = scaletype(axistype.x);
			if(axistype.y)	chart.yscale = scaletype(axistype.y);
		}
	}

	function createGraph(){
		var margin = chart.margin,
			width = chart.width - margin.left - margin.right,
			height = chart.height - margin.top - margin.bottom


		chart.svg().append("g")
			.attr("transform","translate("+margin.left+","+margin.top+")")
			.attr("class","chart")

		chart.chart = function(){
			return chart.svg().select(".chart")
		}
		register_resize()
	}

	function register_resize(){
		if(chart.auto){
			resize()
			window.addEventListener("resize",resize);
		}
	}

	function resize(){
		selectChart().attr("transform","translate("+(chart.margin.left*chart.scale)+","+(chart.margin.top*chart.scale)+")scale("+chart.scale+")")
	}

	function selectChart(){
		return chart.svg().select(".chart")
	}

	function args_check(){
		return containerID?true:false;
	}

	if(args_check()) init()
	return chart
}