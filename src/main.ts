import * as _ from 'underscore'

function ensureKey(n:any, key:string, value:any) {
  if (! (key in n)) n[key] = value; 
  return n;
}

function annotateNetwork(network:any) {

  // const date_to_year = (n:any) => {
  //     if (n.patient_attributes.Year == "N/A" || !n.patient_attributes.Year ) {
  //        return null; 
  //     }

  //     return parseInt (n.patient_attributes.Year.substr(0,4));
  // };

  var annotatedNetwork = network;

  _.each (annotatedNetwork["Nodes"], (n) => {
      //n.year = date_to_year(n);
      n.degree = 0;
  });
  
  _.each (annotatedNetwork["Edges"], (e) => {
        _.each ([e.source,e.target], (n) => {
            annotatedNetwork["Nodes"][n].degree ++;
        });
    });
  
  return annotatedNetwork;

}

/**
 * Computes the degree-weighted homophily (DWH) of a network
 * @param {Object} network - A network JSON that is the result from the [HIV-TRACE](https://github.com/veg/hivtrace) package. Additionally, the results from hivtrace must be annotated using `hivnetworkannotate` from the [hivclustering](https://github.com/veg/hivclustering) package.
 * @param {Function} binBy - A function that is used to bin the nodes in the network into different groups based on a specific attribute. An example function can be found in bin/dws.js.
 * @param {any} value - The value used to filter the nodes in the network
 * @param {Boolean} randomize - Determines whether the nodes in the network will be shuffled randomly before the computation of DWH
 * @returns {Number} The DWH of the network
 */
export default function computeDWH (network:any, binBy:any, value:any, randomize:boolean) {

  if(network["trace_results"]) {
    network = network["trace_results"];

		if (network.Settings && network.Settings.compact_json) {
			network = decompress(network);
		}

  }

  network = annotateNetwork(network);

  let nodeLabels: any[] = [];

  _.each(network.Nodes, (n) => {
    nodeLabels.push(binBy(n) === value ? true : false);
    n.degree = 0;
  });

  if (randomize) {
    nodeLabels = _.shuffle(nodeLabels);
  }

  _.each(network.Edges, (e) => {
    _.each([e.source, e.target], (n) => {
      network.Nodes[n].degree++;
    });
  });

  let nodesIn = 0,
    nodesOut = 0,
    dIn = 0,
    dOut = 0;

  _.each(network.Nodes, (n, i) => {
    if (n.degree > 0) {
      if (nodeLabels[i]) {
        nodesIn++;
        dIn += 1 / n.degree;
      } else {
        nodesOut++;
        dOut += 1 / n.degree;
      }
    }
  });

  let WM = 0,
    WC = 0,
    WX = 0;

  _.each(network.Edges, (e) => {
    let sourceType = nodeLabels[e.source];
    let targetType = nodeLabels[e.target];
    let sourceDegree = network.Nodes[e.source].degree;
    let targetDegree = network.Nodes[e.target].degree;

    if (sourceType === targetType) {
      if (sourceType === true) {
        WM += 1 / sourceDegree / targetDegree;
      } else {
        WC += 1 / sourceDegree / targetDegree;
      }
    } else {
      WX += 1 / sourceDegree / targetDegree;
    }
  });

  WM /= nodesIn * nodesIn;
  WC /= nodesOut * nodesOut;
  WX /= nodesIn * nodesOut;

  return (WM + WC - 2 * WX) / (dIn / nodesIn / nodesIn + dOut / nodesOut / nodesOut);

};

/**
 * Computes fractions of pairwise connections between different node types in a network.
 * @function
 * @param {Object} network - A network JSON that is the result from the [HIV-TRACE](https://github.com/veg/hivtrace) package. Additionally, the results from hivtrace must be annotated using `hivnetworkannotate` from the [hivclustering](https://github.com/veg/hivclustering) package.
 * @param {function} bin - A function that is used to bin the nodes in the network into different groups based on a specific attribute. An example function can be found in bin/dws.js.
 * @param {boolean} randomize - Determines whether the node labels should be randomized before computing pairwise connections.
 * @return {Array} unrolled - An array of objects representing the pairwise connections between different node types, with properties 'from', 'to', and 'count'.
 */
export function computeFractions(network:any, bin:any, randomize:boolean) {

  if(network["trace_results"]) {

    network = network["trace_results"];

		if (network.Settings && network.Settings.compact_json) {
			network = decompress(network);
		}

  }

  network = annotateNetwork(network);

  let nodeLabels: any[] = [];
  
  _.each (network["Nodes"], (n)=>{
      nodeLabels.push (bin(n));
  });

  if (randomize) {
    nodeLabels = _.shuffle (nodeLabels); 
  }
  
  let pairwiseConnections:any = {};

  _.each (network["Edges"], (e) => {
      
      let sourceType = nodeLabels[e.source];
      let targetType = nodeLabels[e.target];


      let sourceDegree = network["Nodes"][e.source].degree;
      let targetDegree = network["Nodes"][e.target].degree;

      ensureKey(pairwiseConnections, sourceType, {});
      ensureKey(pairwiseConnections, targetType, {});
      ensureKey(pairwiseConnections[sourceType], targetType, 0);
      ensureKey(pairwiseConnections[targetType], sourceType, 0);

      pairwiseConnections[sourceType][targetType] += 1/targetDegree/sourceDegree;
      pairwiseConnections[targetType][sourceType] += 1/sourceDegree/targetDegree;

  });
    
  let unrolled:any[] = [];
  _.each (pairwiseConnections, (v, k) => {
      _.each (v, (v2, k2) => {
          unrolled.push ({'from' : k, 'to' : k2, 'count' : v2});
      });
  });

  return unrolled;

}

/**
 * Decompresses compact HIV-TRACE results JSON
 * @function
 * @param {Object} network - A network JSON that is the result from the [HIV-TRACE](https://github.com/veg/hivtrace) package. Additionally, the results from hivtrace must be annotated using `hivnetworkannotate` from the [hivclustering](https://github.com/veg/hivclustering) package.
 * @return {Object} json - Decompressed JSON
 */
export function decompress(json:any) {

	_.each(["Nodes", "Edges"], (key) => {

		let fields = _.keys(json[key]);
		let expanded:any[] = [];

		_.each(fields, (f, idx) => {

			let field_values = json[key][f];
			if (!_.isArray(field_values) && "values" in field_values) {
				//console.log ('COMPRESSED');
				let expanded_values:any[] = [];
				_.each(field_values["values"], (v) => {
					expanded_values.push(field_values["keys"][v]);
				});
				field_values = expanded_values;
			}
			_.each(field_values, (fv, j) => {
				if (idx == 0) {
					expanded.push({});
				}
				expanded[j][f] = fv;
			});

		});

		json[key] = expanded;

	});

  json.Settings.compact_json = false;
	return json;

}


