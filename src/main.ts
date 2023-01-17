import * as _ from 'underscore'

export default function computeDWH (network:any, binBy:any, value:any, randomize:boolean) {

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

