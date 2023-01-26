import * as _ from 'underscore'

function ensureKey(n:any, key:string, value:any) {
  if (! (key in n)) n[key] = value; 
  return n;
}

function annotateNetwork(network:any) {

  const date_to_year = (n:any) => {
      if (n.patient_attributes.Year == "N/A" || !n.patient_attributes.Year ) {
         return null; 
      }
      return parseInt (n.patient_attributes.Year.substr(0,4));
  };
  var annotatedNetwork = network;

  _.each (annotatedNetwork["Nodes"], (n) => {
      n.year = date_to_year(n);
      n.degree = 0;
  });
  
  _.each (annotatedNetwork["Edges"], (e) => {
        _.each ([e.source,e.target], (n) => {
            annotatedNetwork["Nodes"][n].degree ++;
        });
    });
  
  return annotatedNetwork;

}

export default function computeDWH (network:any, binBy:any, value:any, randomize:boolean) {

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

export function computeFractions(network:any, bin:any, randomize:boolean) {

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

