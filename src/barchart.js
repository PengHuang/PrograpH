
var hp = hp||{"ID_counter":0}
hp.barchart=barchart

/**
 * Create and draw a new barchart.
 * 
 * Arguments:
 *   containerId => id of container to insert SVG into. [REQUIRED]
 *   size => a dictionary containing the following keys. [OPTIONAL]
 *        width => the width of the svg canvas. Default:960 [OPTIONAL]
 *        height => the height of the svg canvas. Default:500 [OPTIONAL]
 *        margin => a dictionary containing the margin infomation. [OPTIONAL]
 *                  Default:{left:10,right:10,top:10,bottom:10}
 *        auto => automatically adjust the size based on the container size. Default:false [OPTIONAL]

 *   axis => a dictionary containing the following keys. [OPTIONAL] 
 *        horizontal:true

 *   data => an array containing dictionaries with following keys [REQUIRED]
 *        name => name [REQUIRED]
 *        value =>  value [REQUIRED]
 *        group =>  group [OPTIONAL]
 */
function barchart(args){

  var chart = {}  //The instance object of barchat.
  chart.ID = hp.ID_counter += 1 //global id
  
  //initial chart
  chart.init = function(args){
    if(d3.select("#"+args.containerID).select("svg")[0][0]){
      console.log("already has a svg, redrawing.")
      chart.redraw(args)
      return
    }
    parseArgs(args)
    createGraph()
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
    pointer = args.size
    if(pointer){
      chart.margin = pointer.margin?pointer.margin:{top:50,bottom:50,left:50,right:50}
      chart.width  = (pointer.width?pointer.width:960)-chart.margin.left-chart.margin.right
      chart.height = (pointer.height?pointer.height:500)-chart.margin.top-chart.margin.bottom
      chart.auto   = pointer.auto?true:false
    }else{
      chart.margin = {top:50,bottom:50,left:50,right:50}
      chart.width  = 960-chart.margin.left-chart.margin.right
      chart.height = 500-chart.margin.top-chart.margin.bottom
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
    }else{
      chart.x = d3.scale.ordinal().rangeRoundBands([0, chart.width], chart.bars_gap).domain(chart.region);
      chart.y = d3.scale.linear().range([chart.height,0 ]).domain([0,0]);  
    }
    chart.xAxis = d3.svg.axis().scale(chart.x).orient("bottom");
    chart.yAxis = d3.svg.axis().scale(chart.y).orient("left");

    chart.svg = d3.select("#"+chart.containerID).append("svg")
        .attr("width",chart.width+chart.margin.left+chart.margin.top)
        .attr("height", chart.height+chart.margin.top+chart.margin.bottom)
        .append("g")
        .attr("class","barchart")
        .attr("transform", "translate(" + chart.margin.left + "," + chart.margin.top + ")");

    chart.bars = chart.svg.selectAll(".bar")
        .data(chart.data,function(d){return d.name})
        .enter()
        .append("g")
        .attr("class","bar");

    if(chart.horizontal){
      chart.bars.append("rect")
        .attr("x", function(d) { return 0; })
        .attr("y", function(d) { return chart.y(d.name); })
        .attr("width", function(d) { return 0; })
        .attr("height",chart.y.rangeBand())

      chart.bars.append("text")
        .attr("class", "text")
        .attr("x",function(d){return 0})
        .attr("y",function(d) { return chart.y(d.name)+(chart.y.rangeBand()/2); })
        .attr("dx", 5)
        .attr("text-anchor","start")
    }else{
      chart.bars.append("rect")
        .attr("x", function(d) { return chart.x(d.name); })
        .attr("y", function(d) { return chart.height; })
        .attr("width", chart.x.rangeBand())
        .attr("height",function(d) { return 0; })

      chart.bars.append("text")
        .attr("class", "text")
        .attr("x",function(d){return chart.x(d.name)+(chart.x.rangeBand()/2)})
        .attr("y",function(d){return chart.height})
        .attr("dy",-5)
        .attr("text-anchor","middle")
    }

    //create x axis
    chart.xaxis = chart.svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + chart.height + ")")
      .call(chart.xAxis);
    //create x axis
    chart.yaxis = chart.svg.append("g")
      .attr("class", "y axis")
      .call(chart.yAxis)
    chart.update(chart.data)
  }

  //update the graph 
  chart.update = function(data){

    //check if there's new region
    var addition_data = []
    var region = []
    data.forEach(function(d){
      region.push(d.name)

      if(chart.region.indexOf(d.name)===-1){
        addition_data.push(d)
      }
    })
    chart.data = data
    chart.region = region
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
    chart.xaxis.transition().duration(chart.transition_time).call(chart.xAxis);
    chart.yaxis.transition().duration(chart.transition_time).call(chart.yAxis);

    //append the additional bars
    if(addition_data){
      if(chart.horizontal){
        var newchart = chart.svg.selectAll(".bar").data(addition_data,function(d){return d.name})
          .enter().append("g").attr("class","bar")
        newchart.append("rect")
          .attr("x", function(d) { return 0; })
          .attr("y", function(d) { return chart.y(d.name); })
          .attr("width", function(d) { return 0; })
          .attr("height",chart.y.rangeBand())
        newchart.append("text")
          .attr("class", "text")
          .attr("x",function(d){return 0})
          .attr("y",function(d) { return chart.y(d.name)+(chart.y.rangeBand()/2); })
          .attr("dx", 5)
          .attr("text-anchor","start")
        }else{
          var newchart = chart.svg.selectAll(".bar")
            .data(addition_data,function(d){return d.name}).enter()
            .append("g")
            .attr("class","bar")
          newchart.append("rect")
            .attr("x", function(d) { return chart.x(d.name); })
            .attr("y", function(d) { return chart.height; })
            .attr("width", chart.x.rangeBand())
            .attr("height",function(d) { return 0; })
          newchart.append("text")
            .attr("class", "text")
            .attr("x",function(d){return chart.x(d.name)+(chart.x.rangeBand()/2)})
            .attr("y",function(d){return chart.height})
            .attr("dy",-5)
            .attr("text-anchor","middle")
        }
      
    }
    
    //update bars
    var bars = chart.svg.selectAll(".bar").data(chart.data,function(d){return d.name})
    if(chart.horizontal){
      bars.select("rect")
        .transition().duration(chart.transition_time)
        .attr("y", function(d) { return chart.y(d.name); })
        .attr("width", function(d) { return chart.x(d.value); })
        .attr("height",chart.y.rangeBand())
      bars.select("text")
        .transition().duration(chart.transition_time)
        .attr("x",function(d) { return chart.x(d.value); })
        .attr("y", function(d) { return chart.y(d.name); })
        .text(function(d){return d.value})
    }else{ 
      bars.select("rect")
        .transition().duration(chart.transition_time)
        .attr("y", function(d) { return chart.y(d.value); })
        .attr("height",function(d) { return chart.height-chart.y(d.value); })
      bars.select("text")
        .transition().duration(chart.transition_time)
        .attr("y", function(d) { return chart.y(d.value); })
        .text(function(d){return d.value})
    }
    bars.exit().remove() //remove the old chart
  }

  
  chart.redraw = function(args){
    chart.exit()
    chart.init(args)
  }

  //exit the graph
  chart.exit = function(){
    d3.select("#"+chart.containerID).select("svg").remove()
  }
  //reset the graph
  chart.reset = function(){

  }

  if(args) chart.init(args);
  return chart
}


