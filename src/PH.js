//global parameters
var hp = hp||{"ID_counter":0,"events":{"resize":[]}}

hp.graph = HP_graph;
hp.chart = HP_chart;
hp.barchart = HP_barchart;


/**
 * Create and draw a new graph.
 * 
 * Arguments:
 *   containerId => id of container to insert SVG. [REQUIRED]
 *   width => the width of the svg canvas. Default:960 [OPTIONAL]
 *   height => the height of the svg canvas. Default:500 [OPTIONAL]
 *   auto => automatically adjust the size based on the container size. Default:false [OPTIONAL]
 */
function HP_graph(args){
	var graph = {}

	function init(){
		graph.svgID = hp.ID_counter += 1;

		//set the Default values
		graph.width = 960;
		graph.height = 500;
		graph.auto = false;
		graph.scale = 1;
		parseArgs();
		createGraph();
	}	

	function parseArgs(){
		graph.containerID = args.containerID;
		if(args.width) graph.width = args.width;
		if(args.height) graph.height = args.height;
		if(args.auto) graph.auto = args.auto;
	}

	function createGraph(){
		var width = graph.width,
			height = graph.height


		d3.select("#"+graph.containerID)
			.append("svg")
			.attr("width",width)
			.attr("height",height)
			.attr("id","svg_"+graph.svgID);


		graph.container = get_container;
		graph.svg = get_svg;
		graph.exit = exit;
		graph.hide = hide;
		graph.show = show;
		graph.fade = fade;

		register_resize();
		show();
	}

	function get_container(){
		return d3.select("#"+graph.containerID)
	}
	function get_svg(){
		return graph.container().select("#svg_"+graph.svgID)
	}
	function hide(animation){
		get_svg().transition().duration(500).attr("opacity",0)
	}
	function show(){
		get_svg().transition().duration(500).attr("opacity",1)
	}
	function fade(para){
		get_svg().transition().duration(500).attr("opacity",para)
	}
	function exit(){
		get_svg().remove()
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
		if(args){
			if(args.containerID){
				return true;
			}
		}
		return false;
	}

	if(args_check()) init();

	return graph;
}





/**
 * Create and draw a new graph.
 * 
 * Arguments:
 *   width => the width of the svg canvas. Default:960 [OPTIONAL]
 *   height => the height of the svg canvas. Default:500 [OPTIONAL]
 *   margin => a dictionary containing the margin infomation. [OPTIONAL]
 *                  Default:{left:100,right:100,top:50,bottom:50}
 *   auto => automatically adjust the size based on the container size. Default:false [OPTIONAL]
 */
function HP_chart(args){
	var chart = {}

	function init(){
		chart = hp.graph(args)
		chart.margin = {top:100,bottom:100,left:100,right:100};

		parseArgs();
		createGraph();
	}	

	function parseArgs(){
		if(args.margin) chart.margin = args.margin;
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
		getChart().attr("transform","translate("+(chart.margin.left*chart.scale)+","+(chart.margin.top*chart.scale)+")scale("+chart.scale+")")
	}

	function getChart(){
		return chart.svg().select(".chart")
	}

	function args_check(){
		if(args){
			if(args.containerID){
				return true;
			}
		}
		return false;
	}

	if(args_check()) init()
	return chart
}



/**
 * Create and draw a new barchart.
 * 
 * Arguments:
 *   
 *   basic => a dictionary containing the following keys. [OPTIONAL]
 *		  containerId => id of container to insert SVG. [REQUIRED]
 *        width => the width of the svg canvas. Default:960 [OPTIONAL]
 *        height => the height of the svg canvas. Default:500 [OPTIONAL]
 *        margin => a dictionary containing the margin infomation. [OPTIONAL]
 *                  Default:{left:10,right:10,top:10,bottom:10}
 *        auto => automatically adjust the size based on the container size. Default:false [OPTIONAL]
 *
 *   axis => a dictionary containing the following keys. [OPTIONAL] 
 *        horizontal:true
 *   
 *   data => an array containing dictionaries with following keys [REQUIRED]
 *        name => name [REQUIRED]
 *        value =>  value [REQUIRED]
 *        group =>  group [OPTIONAL]
 */
function HP_barchart(args){
	var barchart = {}
	var region,x,y,xAxis,yAxis
	var bars_gap,transition_time,font_size
	var private_arg = "barchart"

	function init(){
		barchart = hp.chart(args.basic)
		barchart.horizontal = false;
		parseArgs();
		createGraph();
	}

	function parseArgs(){
		if(args.data){
			barchart.data = args.data;
			region = []
			barchart.data.forEach(function(d){
		      region.push(d)
		    })
		}
		if(args.axis) barchart.horizontal = args.axis.horizontal;

		//hardcore arguments
		bars_gap =.4
		transition_time = 750
		font_size = 24
	}

	function createGraph(){

		var margin = barchart.margin,
			width = barchart.width - margin.left - margin.right,
			height = barchart.height - margin.top - margin.bottom,
			horizontal = barchart.horizontal

		if(horizontal){
	      x = d3.scale.linear().range([0,width]).domain([0,0]);
	      y = d3.scale.ordinal().rangeRoundBands([0, height], bars_gap); 
	      xAxis = d3.svg.axis().scale(x).orient("bottom").tickSize(-height, 0, 5);
	      yAxis = d3.svg.axis().scale(y).orient("left").tickSize(0, 0, 5); 
	    }else{
	      x = d3.scale.ordinal().rangeRoundBands([0, width], bars_gap);
	      y = d3.scale.linear().range([height,0 ]).domain([0,0]);  
	      xAxis = d3.svg.axis().scale(x).orient("bottom").tickSize(0, 0, 5);
	      yAxis = d3.svg.axis().scale(y).orient("left").tickSize(-width, 0, 5).tickPadding(8);
	    }

	    var c = barchart.chart().classed("barchart",true);
	    var bars_group = c.append("g")
	        .attr("class","barchart_bars_group")
	    var axis_g = c.append("g")
	        .attr("class","barchart_axis_group")
	    //create x axis
	    axis_g.append("g")
	      .attr("class", "x axis")
	      .attr("transform", "translate(0," + height + ")")
	      .call(xAxis);
	    //create x axis
	    axis_g.append("g")
	      .attr("class", "y axis")
	      .call(yAxis)


	    //update the graph 
		barchart.update = function(newdata){
			//check if there's new region
			var addition_data = []
			var exist_data = []
			// var region = []

			newdata.forEach(function(d){
			  // region.push(d.name)
			  if(region.indexOf(d.name)===-1){
			    addition_data.push(d)
			  }else{
			    exist_data.push(d)
			  }
			})
			data = exist_data.concat(addition_data)
			// data.sort(function(a,b){return a.value-b.value;})
			region=[]
			data.forEach(function(d){
			  region.push(d.name)
			})

			//update axis
			var maxvalue = d3.max(newdata,function(d){return d.value})
			var minvalue = 0
			if(horizontal){
			  x.domain([minvalue,maxvalue]);
			  y.domain(region); 
			}else{
			  x.domain(region);
			  y.domain([minvalue,maxvalue]);
			}
			xAxis.scale(x);
			yAxis.scale(y);
			get_x_axis().transition().duration(transition_time).call(xAxis);
			get_y_axis().transition().duration(transition_time).call(yAxis);

			//append the additional bars
			if(addition_data){
			  if(horizontal){
			    var newchart = get_bars_group().selectAll(".bar")
			      .data(addition_data,function(d){return d.name}).enter()
			      .insert("g")
			      .attr("class","bar")
			    newchart.insert("rect")
			      .attr("x", function(d) { return 0; })
			      .attr("y", function(d) { return y(d.name); })
			      .attr("width", function(d) { return 0; })
			      .attr("height",y.rangeBand())
			    newchart.insert("text")
			      .attr("class", "text")
			      .attr("x",function(d){return 0})
			      .attr("y",function(d) { return y(d.name)+(y.rangeBand()/2); })
			      .attr("dx", 5)
			      .attr("dy", font_size/3)
			      .attr("text-anchor","start")
			      .style("font-size",font_size)
			  }else{
			    var newchart = get_bars_group().selectAll(".bar")
			      .data(addition_data,function(d){return d.name}).enter()
			      .insert("g")
			      .attr("class","bar")
			    newchart.insert("rect")
			      .attr("x", function(d) { return x(d.name); })
			      .attr("y", function(d) { return height; })
			      .attr("width", x.rangeBand())
			      .attr("height",function(d) { return 0; })
			    newchart.insert("text")
			      .attr("class", "text")
			      .attr("x",function(d){return x(d.name)+(x.rangeBand()/2)})
			      .attr("y",function(d){return height})
			      .attr("dy",-5)
			      .attr("text-anchor","middle")
			      .style("font-size",font_size)
			  }
			}

			//update bars
			var bars = get_bars_group().selectAll(".bar").data(data,function(d){return d.name})
			if(horizontal){
			  bars.select("rect")
			    .transition().duration(transition_time)
			    .attr("y", function(d) { return y(d.name); })
			    .attr("width", function(d) { return x(d.value); })
			    .attr("height",y.rangeBand())
			  bars.select("text")
			    .transition().duration(transition_time)
			    .attr("x",function(d) { return x(d.value); })
			    .attr("y", function(d) { return y(d.name)+y.rangeBand()/2; })
			    .text(function(d){return d.value})
			}else{ 
			  bars.select("rect")
			    .transition().duration(transition_time)
			    .attr("x",function(d){return x(d.name);})
			    .attr("y", function(d) { return y(d.value);})
			    .attr("width",function(d){return x.rangeBand()})
			    .attr("height",function(d) { return height-y(d.value); })
			  bars.select("text")
			    .transition().duration(transition_time)
			    .attr("x",function(d){return x(d.name)+x.rangeBand()/2;})
			    .attr("y", function(d) { return y(d.value); })
			    .text(function(d){return d.value})
			}
			bars.exit().remove() //remove the old chart
		}
		barchart.reset = function(){
			barchart.update([])
		}
		if(barchart.data) barchart.update(barchart.data);
	}

	function get_bars_group(){
		return barchart.chart().select(".barchart_bars_group")
	}

	function get_axis_group(){
		return barchart.chart().select(".barchart_axis_group")
	}

	function get_x_axis(){
		return get_axis_group().select(".x")
	}

	function get_y_axis(){
		return get_axis_group().select(".y")
	}
	if(args) init()
	return barchart;
}