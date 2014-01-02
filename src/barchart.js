var hp = hp||{"ID_counter":0}

hp.barchart = HP_barchart;


/**
 * Create and draw a new barchart.
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
 *        horizontal:true
 * 		  ticks:
 *		  tickFormat:
 *		  
 *   
 *   data => an array containing dictionaries with following keys [REQUIRED]
 *        name => name [REQUIRED]
 *        value =>  value [REQUIRED]
 *        group =>  group [OPTIONAL]
 */
function HP_barchart(args){
	var valueFormat = d3.format(",.1%")
	var barchart = {}
	var region,x,y,xAxis,yAxis,ticks,tickFormat
	var bars_gap,transition_time,font_size

	// console.log(args.containerID)
	function init(){
		var axistype = {x:"ordinal",y:"linear"}
		barchart = hp.chart(args.containerID,args.size,axistype)
		barchart.data = []
		region=[]
		barchart.horizontal = false;
		parseArgs();
		createGraph();
	}

	function parseArgs(){
		if(args.data) barchart.data = args.data;
		if(args.axis) {
			if(args.axis.horizontal) barchart.horizontal = args.axis.horizontal;
			if(args.axis.ticks)	ticks = args.axis.ticks;
			if(args.axis.tickFormat) tickFormat = d3.format(args.axis.tickFormat);
		}
		//hardcore arguments
		bars_gap =.4
		transition_time = 750
		font_size = 12
	}

	function createGraph(){
		var margin = barchart.margin,
			width = barchart.width - margin.left - margin.right,
			height = barchart.height - margin.top - margin.bottom,
			horizontal = barchart.horizontal

		if(horizontal){
		//if horizontal is true, logical x axis will appear as y axis
	      x = barchart.yscale.range([0,width]).domain([0,0]);
	      y = barchart.xscale.rangeRoundBands([0, height], bars_gap); 
	      xAxis = d3.svg.axis().scale(x).orient("bottom").tickSize(-height, 0, 5);
	      yAxis = d3.svg.axis().scale(y).orient("left").tickSize(0, 0, 5); 
	    }else{
	      x = barchart.xscale.rangeRoundBands([0, width], bars_gap);
	      y = barchart.yscale.range([height,0 ]).domain([0,0]);  
	      xAxis = d3.svg.axis().scale(x).orient("bottom").tickSize(0, 0, 5);
	      yAxis = d3.svg.axis().scale(y).orient("left").tickSize(-width, 0, 5).tickPadding(8).ticks(ticks).tickFormat(tickFormat);
	    }

	    var c = barchart.chart().classed("barchart",true);

	    c.append("g").attr("class","bars_group")

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


	    //update the graph 
		barchart.update = function(newdata){
			//check if there's new region
			var addition_data = []
			var exist_data = []

			newdata.forEach(function(d){
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
			    .text(function(d){return valueFormat(d.value)})
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
			    .text(function(d){return valueFormat(d.value)})
			}
			bars.exit().remove() //remove the old chart
		}
		barchart.reset = function(){
			barchart.update([])
		}
		if(barchart.data) barchart.update(barchart.data);
	}

	function get_bars_group(){
		return barchart.chart().select(".bars_group")
	}

	function get_axis_group(){
		return barchart.chart().select(".axis_group")
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
	return barchart;
}