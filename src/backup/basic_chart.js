var hp = hp||{"ID_counter":0,"events":{"resize":[]}}
hp.basic_chart = basic_chart;

function basic_chart(args){
	var svgID
	var chart = {}
	var margin = {top:100,bottom:100,left:100,right:100}
		width = 960,
		height = 500;

	function init(){
		chart.svgID = hp.ID_counter += 1
		chart.args = args;
  	}

  	function parseArgs(){
  		
  	}

  	init();



	return basic_chart;
}