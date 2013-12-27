
var hp = hp||{"ID_counter":0}
hp.events={}
hp.events.resize=[]

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

  var default_margin = {top:100,bottom:100,left:100,right:100},
      default_width = 960,
      default_height = 500
  var chart = {}  //The instance object of barchat.
  chart.ID = hp.ID_counter += 1 //global id
  //initial chart
  function init(args){
    if(!d3.select("#"+args.containerID).select("svg").empty()){
      console.log("already has a svg, redrawing.")
      chart.redraw(args)
      return
    }
    parseArgs(args)
    createGraph()
    if(chart.auto){
      resize()
      hp.events.resize.push(resize)
      d3.select(window).on('resize', register_resize);      
    }
  }
  
  function register_resize(){
    hp.events.resize.forEach(function(d){
      d()
    })
  }
  /*parse args to the chart*/
  function parseArgs(args){

    /*configure required args*/
    chart.containerID = args.containerID
    chart.data = args.data||[]
    chart.region = []
    chart.data.forEach(function(d){
      chart.region.push(d.name)
    })

    /*temp hardcore args*/
    chart.bars_gap = .4
    chart.transition_time = 750

    /*configured optional args*/
    var pointer
    pointer = args.layout
    if(pointer){
      chart.margin = pointer.margin?pointer.margin:default_margin
      chart.width  = (pointer.width?pointer.width:default_width)-chart.margin.left-chart.margin.right
      chart.height = (pointer.height?pointer.height:default_height)-chart.margin.top-chart.margin.bottom
      chart.auto   = pointer.auto?true:false
    }else{
      chart.margin = default_margin
      chart.width  = default_width-chart.margin.left-chart.margin.right
      chart.height = default_height-chart.margin.top-chart.margin.bottom
      chart.auto   = false
    }

    pointer = args.axis
    if(pointer){
      chart.horizontal = pointer.horizontal?true:false
    }else{
      chart.horizontal = false
    }

    pointer = null
  }

  //create graph
  function createGraph(){
    if(chart.horizontal){
      chart.x = d3.scale.linear().range([0,chart.width]).domain([0,0]);
      chart.y = d3.scale.ordinal().rangeRoundBands([0, chart.height], chart.bars_gap).domain(chart.region); 
      chart.xAxis = d3.svg.axis().scale(chart.x).orient("bottom").tickSize(-chart.height, 0, 0);
      chart.yAxis = d3.svg.axis().scale(chart.y).orient("left").tickSize(0, 0, 0); 
    }else{
      chart.x = d3.scale.ordinal().rangeRoundBands([0, chart.width], chart.bars_gap).domain(chart.region);
      chart.y = d3.scale.linear().range([chart.height,0 ]).domain([0,0]);  
      chart.xAxis = d3.svg.axis().scale(chart.x).orient("bottom").tickSize(0, 0, 0);
      chart.yAxis = d3.svg.axis().scale(chart.y).orient("left").tickSize(-chart.width, 0, 5).tickPadding(8);
    }
    // chart.xAxis = d3.svg.axis().scale(chart.x).orient("bottom").tickSize(-chart.height, 0, 0);
    // chart.yAxis = d3.svg.axis().scale(chart.y).orient("left").tickSize(-chart.width, 0, 0);

    var svg = d3.select("#"+chart.containerID).append("svg")
        .attr("width",chart.width+chart.margin.left+chart.margin.top)
        .attr("height", chart.height+chart.margin.top+chart.margin.bottom)

    var barchart = svg.append("g")
        .attr("class","barchart")
        .attr("transform", "translate(" + chart.margin.left + "," + chart.margin.top + ")");

    var bars_group = barchart.append("g")
        .attr("class","barchart_bars_group")

    var axis_group = barchart.append("g")
        .attr("class","barchart_axis_group")

    var bars = bars_group.selectAll(".bar")
        .data(chart.data,function(d){return d.name})
        .enter()
        .append("g")
        .attr("class","bar");

    if(chart.horizontal){
      bars.append("rect")
        .attr("x", function(d) { return 0; })
        .attr("y", function(d) { return chart.y(d.name); })
        .attr("width", function(d) { return 0; })
        .attr("height",chart.y.rangeBand())

      bars.append("text")
        .attr("class", "text")
        .attr("x",function(d){return 0})
        .attr("y",function(d) { return chart.y(d.name)+(chart.y.rangeBand()/2); })
        .attr("dx", 5)
        .attr("text-anchor","start")
    }else{
      bars.append("rect")
        .attr("x", function(d) { return chart.x(d.name); })
        .attr("y", function(d) { return chart.height; })
        .attr("width", chart.x.rangeBand())
        .attr("height",function(d) { return 0; })

      bars.append("text")
        .attr("class", "text")
        .attr("x",function(d){return chart.x(d.name)+(chart.x.rangeBand()/2)})
        .attr("y",function(d){return chart.height})
        .attr("dy",-5)
        .attr("text-anchor","middle")
    }

    //create x axis
    axis_group.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + chart.height + ")")
      .call(chart.xAxis);
    //create x axis
    axis_group.append("g")
      .attr("class", "y axis")
      .call(chart.yAxis)
    chart.update(chart.data)
  }

  //update the graph 
  chart.update = function(data){

    //check if there's new region
    var addition_data = []
    var exist_data = []
    // var region = []

    data.forEach(function(d){
      // region.push(d.name)
      if(chart.region.indexOf(d.name)===-1){
        addition_data.push(d)
      }else{
        exist_data.push(d)
      }
    })
    chart.data = exist_data.concat(addition_data)

    chart.region=[]
    chart.data.forEach(function(d){
      chart.region.push(d.name)
    })

    //update axis
    var maxvalue = d3.max(data,function(d){return d.value})
    var minvalue = 0
    if(chart.horizontal){
      chart.x.domain([minvalue,maxvalue]);
      chart.y.domain(chart.region); 
    }else{
      chart.x.domain(chart.region);
      chart.y.domain([minvalue,maxvalue]);
    }
    chart.xAxis.scale(chart.x);
    chart.yAxis.scale(chart.y);
    chart.xaxis().transition().duration(chart.transition_time).call(chart.xAxis);
    chart.yaxis().transition().duration(chart.transition_time).call(chart.yAxis);

    //append the additional bars
    if(addition_data){
      if(chart.horizontal){
        var newchart = chart.bars_group().selectAll(".bar")
          .data(addition_data,function(d){return d.name}).enter()
          .insert("g")
          .attr("class","bar")
        newchart.insert("rect")
          .attr("x", function(d) { return 0; })
          .attr("y", function(d) { return chart.y(d.name); })
          .attr("width", function(d) { return 0; })
          .attr("height",chart.y.rangeBand())
        newchart.insert("text")
          .attr("class", "text")
          .attr("x",function(d){return 0})
          .attr("y",function(d) { return chart.y(d.name)+(chart.y.rangeBand()/2); })
          .attr("dx", 5)
          .attr("text-anchor","start")
        }else{
          var newchart = chart.bars_group().selectAll(".bar")
            .data(addition_data,function(d){return d.name}).enter()
            .insert("g")
            .attr("class","bar")
          newchart.insert("rect")
            .attr("x", function(d) { return chart.x(d.name); })
            .attr("y", function(d) { return chart.height; })
            .attr("width", chart.x.rangeBand())
            .attr("height",function(d) { return 0; })
          newchart.insert("text")
            .attr("class", "text")
            .attr("x",function(d){return chart.x(d.name)+(chart.x.rangeBand()/2)})
            .attr("y",function(d){return chart.height})
            .attr("dy",-5)
            .attr("text-anchor","middle")
        }
    }
    
    //update bars
    var bars = chart.svg().selectAll(".bar").data(chart.data,function(d){return d.name})
    if(chart.horizontal){
      bars.select("rect")
        .transition().duration(chart.transition_time)
        .attr("y", function(d) { return chart.y(d.name); })
        .attr("width", function(d) { return chart.x(d.value); })
        .attr("height",chart.y.rangeBand())
      bars.select("text")
        .transition().duration(chart.transition_time)
        .attr("x",function(d) { return chart.x(d.value); })
        .attr("y", function(d) { return chart.y(d.name)+chart.y.rangeBand()/2; })
        .text(function(d){return d.value})
    }else{ 
      bars.select("rect")
        .transition().duration(chart.transition_time)
        .attr("x",function(d){return chart.x(d.name);})
        .attr("y", function(d) { return chart.y(d.value);})
        .attr("width",function(d){return chart.x.rangeBand()})
        .attr("height",function(d) { return chart.height-chart.y(d.value); })
      bars.select("text")
        .transition().duration(chart.transition_time)
        .attr("x",function(d){return chart.x(d.name)+chart.x.rangeBand()/2;})
        .attr("y", function(d) { return chart.y(d.value); })
        .text(function(d){return d.value})
    }
    bars.exit().remove() //remove the old chart
  }

  
  chart.redraw = function(args){
    exit()
    init(args)
  }
  chart.exit = function(){
    exit()
  }
  chart.init = function(args){
    init(args)
  }
  //exit the graph
  function exit(){
    chart.svg().remove()
  }
  //reset the graph
  chart.reset = function(){

  }

  function resize(){
    var current_width = parseInt(d3.select("#"+chart.containerID).style('width'));
    var ratio = current_width/(chart.width+chart.margin.left+chart.margin.right)
    chart.svg()
      .attr("width",(chart.width+chart.margin.left+chart.margin.right)*ratio)
      .attr("height",(chart.height+chart.margin.top+chart.margin.bottom)*ratio)
    chart.barchart().attr("transform","translate("+(chart.margin.left*ratio)+","+(chart.margin.top*ratio)+")scale("+ratio+")")
  }

  chart.svg = function(){
    return d3.select("#"+chart.containerID).select("svg")
  }

  chart.barchart = function(){
    return chart.svg().select(".barchart")
  }

  chart.bars_group = function(){
    return chart.barchart().select(".barchart_bars_group")
  }

  chart.axis_group = function(){
    return chart.barchart().select(".barchart_axis_group")
  }

  chart.xaxis = function(){
    return chart.axis_group().select(".x")
  }

  chart.yaxis = function(){
    return chart.axis_group().select(".y")
  }
  
  if(args) init(args);
  return chart
}


