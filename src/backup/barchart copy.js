
var hp = hp||{"ID_counter":0,"events":{"resize":[]}}


hp.barchart=barchart
// hp.remotedata = remotedata

/**
 * Create and draw a new barchart.
 * 
 * Arguments:
 *   containerId => id of container to insert SVG. [REQUIRED]
 *   layout => a dictionary containing the following keys. [OPTIONAL]
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
function barchart(args){
  var svgID,containerID
  var data,region,x,y,xAxis,yAxis
  var margin = {top:100,bottom:100,left:100,right:100},
      width = 960,
      height =500,
      font_size = 24;
  var ratio = 1;
  var transition_time = 750,
      bars_gap = 0.4

  var horizontal = false,
      auto = false;
  
  var chart = {}  //The instance object of barchat.

  //initial chart
  function init(){
    // console.log(args)
    // if(!check_args(args)){
    //   error("Invalid arguments")
    //   return;
    // } 
    if(!args.containerID){
      return
    }
    parseArgs(args)
    createGraph()
    if(auto){
      resize()
      hp.events.resize.push(resize)
      d3.select(window).on('resize', register_resize);      
    }
    chart.show()
  }

  function register_resize(){
    hp.events.resize.forEach(function(d){
      d()
    })
  }

  // function check_args(args){
  //   if(args.containerID){}
  //     else{return false;} 
  //   if(args.data){}
  //     else{return false;} 
  //   return true
  // }
  /*parse args to the chart*/
  function parseArgs(args){
    /*configure required args*/
    containerID = args.containerID
    data = args.data
    region = []
    data.forEach(function(d){
      region.push(d)
    })

    /*configured optional args*/
    var pointer
    pointer = args.layout
    if(pointer){
      margin = pointer.margin?pointer.margin:margin
      width = (pointer.width?pointer.width:width)-margin.left-margin.right
      height = (pointer.height?pointer.height:height)-margin.top-margin.bottom
      auto   = pointer.auto?true:false
    }

    pointer = args.axis
    if(pointer){
      horizontal = pointer.horizontal?true:false
    }

    pointer = null
  }

  //create graph
  function createGraph(){
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
    // chart.xAxis = d3.svg.axis().scale(chart.x).orient("bottom").tickSize(-chart.height, 0, 0);
    // chart.yAxis = d3.svg.axis().scale(chart.y).orient("left").tickSize(-chart.width, 0, 0);
    svgID = hp.ID_counter += 1
    var svg = d3.select("#"+containerID).append("svg")
        .attr("width",width+margin.left+margin.top)
        .attr("height", height+margin.top+margin.bottom)
        .attr("id","graph_"+svgID)

    var barchart = svg.append("g")
        .attr("class","barchart")

    var bars_group = barchart.append("g")
        .attr("class","barchart_bars_group")

    var axis_g = barchart.append("g")
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
    if(data)  chart.update(data);
  }

  //update the graph 
  chart.update = function(data){
    //check if there's new region
    var addition_data = []
    var exist_data = []
    // var region = []

    data.forEach(function(d){
      // region.push(d.name)
      if(region.indexOf(d.name)===-1){
        addition_data.push(d)
      }else{
        exist_data.push(d)
      }
    })
    data = exist_data.concat(addition_data)

    region=[]
    data.forEach(function(d){
      region.push(d.name)
    })

    //update axis
    var maxvalue = d3.max(data,function(d){return d.value})
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
    xaxis().transition().duration(transition_time).call(xAxis);
    yaxis().transition().duration(transition_time).call(yAxis);

    //append the additional bars
    if(addition_data){
      if(horizontal){
        var newchart = bars_group().selectAll(".bar")
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
        var newchart = bars_group().selectAll(".bar")
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
    var bars = svg().selectAll(".bar").data(data,function(d){return d.name})
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

  
  // chart.redraw = function(args){
  //   exit()
  //   init(args)
  // }
  chart.hide = function(animation){
    svg().transition().duration(500).attr("opacity",0)
  }
  chart.show = function(){
    svg().transition().duration(500).attr("opacity",1)
  }
  chart.fade = function(para){
    svg().transition().duration(500).attr("opacity",para)
  }
  chart.exit = function(){
    exit()
  }
  chart.resize = function(){
    resize()
  }
  // chart.init = function(args){
  //   init(args)
  // }
  //exit the graph
  function exit(){
    svg().remove()
  }
  //reset the graph
  chart.reset = function(){
    chart.update([])
  }

  function resize(){
    var current_width = parseInt(d3.select("#"+containerID).style('width'));
    ratio = current_width/(width+margin.left+margin.right)
    svg()
      .attr("width",(width+margin.left+margin.right)*ratio)
      .attr("height",(height+margin.top+margin.bottom)*ratio)
    barchart().attr("transform","translate("+(margin.left*ratio)+","+(margin.top*ratio)+")scale("+ratio+")")
  }

  function svg(){
    return d3.select("#"+containerID).select("#graph_"+svgID)
  }
  function graph(){
    return svg().select("g")
  }

  function barchart(){
    return svg().select(".barchart")
  }

  function bars_group(){
    return barchart().select(".barchart_bars_group")
  }

  function axis_group(){
    return barchart().select(".barchart_axis_group")
  }

  function xaxis(){
    return axis_group().select(".x")
  }

  function yaxis(){
    return axis_group().select(".y")
  }
  
  function debug(msg){
    console.log("DEBUG: " + msg)
  }
  function error(msg){
    console.log("ERROR: " + msg)
  }
  function warning(msg){
    console.log("WARNING: " + msg)
  }

  chart.addtosvg = function(svgContainerID,svgwidth,svgheight){
    args.containerID = svgContainerID
    width = svgwidth;
    height = svgheight;
    auto = false
    init()
    // resize()
  }
  if(args) init();
  return chart
}


