var hp = hp||{"ID_counter":0}

hp.linechart = HP_linechart;


/**
 * Create and draw a new linechart.
 * 
 * Arguments:
 *   containerID 
 *   size => a dictionary containing the following keys. [OPTIONAL]
 *        width => the width of the svg canvas. Default:960 [OPTIONAL]
 *        height => the height of the svg canvas. Default:500 [OPTIONAL]
 *        margin => a dictionary containing the margin infomation. [OPTIONAL]
 *                  Default:{left:10,right:10,top:10,bottom:10}
 *        auto => automatically adjust the size based on the container size. Default:false [OPTIONAL]
 *
 *   axis => a dictionary containing the following keys. [OPTIONAL] 
 * 		  ticks:
 *		  tickFormat:
 *   
 *   data => an array containing dictionaries with following keys [REQUIRED]
 *        xvalue => xvalue [REQUIRED]
 *        yvalue => an array
 *				name => 
 *				value => [REQUIRED]
 *        group =>  group [OPTIONAL]
 */
function HP_linechart(args){
	var valueFormat = d3.format(",.1%")
	var linechart = {}
	var x,y,xAxis,yAxis,ticks,tickFormat,interpolate
	var transition_time,font_size,color
	

	// console.log(args.containerID)
	function init(){
		var axistype = {x:"linear",y:"linear"}
		linechart = hp.chart(args.containerID,args.size,axistype)
		linechart.data = []

		//hardcore arguments
		transition_time = 750
		font_size = 12
		interpolate = "linear"
		color = d3.scale.category10();

		parseArgs();
		createGraph();
	}

	function parseArgs(){
		
		// tickFormat = d3.format(",.2%")

		if(args.data) linechart.data = args.data;
		if(args.axis) {
			if(args.axis.ticks)	ticks = args.axis.ticks;
			if(args.axis.tickFormat) tickFormat = d3.format(args.axis.tickFormat);
		}
	}

	function createGraph(){
		var margin = linechart.margin,
			width = linechart.width - margin.left - margin.right,
			height = linechart.height - margin.top - margin.bottom,


	    x = linechart.xscale.range([0, width]).domain([0,0]);
	    y = linechart.yscale.range([height,0 ]).domain([0,0]);  
	    xAxis = d3.svg.axis().scale(x).orient("bottom").tickSize(-height, 0, 5);
	    yAxis = d3.svg.axis().scale(y).orient("left").tickSize(-width, 0, 5).tickPadding(8).ticks(ticks).tickFormat(tickFormat);

	    var c = linechart.chart().classed("linechart",true);
	    var lines_g = c.append("g").attr("class","lines_group")
	    var currentlines = []
	    var aline = lines_g.append("path").attr("class","line")
	    var axis_g = c.append("g")
	        .attr("class","axis_group")
	    //create x axis
	    axis_g.append("g")
	      .attr("class", "x axis")
	      .attr("transform", "translate(0," + height + ")")
	      .call(xAxis);
	    //create x axis
	    axis_g.append("g")
	      .attr("class", "y axis")
	      .call(yAxis)

	    linechart.update = function(data){
	    	while(data.yvalue.length>currentlines.length){
	    		var aline = lines_g.append("path").attr("class","line")
	    		currentlines.push(aline)
	    	}
	    	x.domain(d3.extent(data.xvalue))
	    	var ymax = d3.max(data.yvalue,function(d){return d3.max(d.value)})
	    	var ymin = d3.min(data.yvalue,function(d){return d3.min(d.value)})
	    	ymin = (ymax-ymin)/5>ymin?0:ymin-((ymax-ymin)/5)

	    	y.domain([ymin,ymax])
	    	xAxis.scale(x)
	    	yAxis.scale(y)
	    	get_x_axis().transition().duration(transition_time).call(xAxis)
	    	get_y_axis().transition().duration(transition_time).call(yAxis)
	    	console.log(ymax)
	    	console.log(ymin)
	    	
			for(var k = 0,j = data.yvalue.length;k<j;k++){
				var line = d3.svg.line()
		    		.interpolate(interpolate)
				    .x(function(d,i) { return x(data.xvalue[i]); })
				    .y(function(d,i) { return y(data.yvalue[k].value[i]); });

				currentlines[k].datum(data.yvalue[k].value)
		      		.transition().duration(transition_time)
		      		.attr("d", line);
			}
			console.log(currentlines.length)

	    }  

	    linechart.reset = function(){
			linechart.update([])
		}

	    if(linechart.data) linechart.update(linechart.data);
	}

	function get_axis_group(){
		return linechart.chart().select(".axis_group")
	}

	function get_x_axis(){
		return get_axis_group().select(".x")
	}

	function get_y_axis(){
		return get_axis_group().select(".y")
	}

	function args_check(){
		return args.containerID?true:false;
	}
	if(args_check()) init()
	return linechart;
}