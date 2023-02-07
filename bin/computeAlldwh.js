#!/usr/bin/env node

import { program } from 'commander';
import { default as dwh, computeFractions, decompress } from "../dist/dwh.es.js";
import * as d3 from 'd3';
import * as R from "ramda";
import * as fs from 'fs';

var network;

// binBy:any, value:any, randomize:boolean

// binBy is a function that we will have to make static for the command line application 
let nodeCategoryRaw = (field, n) => {

  let desc = null;

  try {
    desc = n['patient_attributes'][field];
  } catch {
    console.warn(`No patient attributes for ${n.id}`)
  }

  if (desc == "MSM") {
    return desc; 
  }

  //return desc + " (" + n['patient_attributes']['Gender'] + ")";
  return desc

}


program
  .arguments("<network>", "Input network file")
  .action(cmd => {
    network = JSON.parse(fs.readFileSync(cmd));       
  })
  .option(
    "-o --output <file>",
    "output path"
  )


program
  .on("--help", function() {
    console.log("");
    console.log("Examples:");
    console.log(
      'dwh'
    );
  })
  .parse(process.argv);

const options = program.opts();

if(network["trace_results"]) {

  network = network["trace_results"];

  if (network.Settings && network.Settings.compact_json) {
    network = decompress(network);
  }

}

function getAssortativities(value, selectedKey, obj) {
  // calculate dwh for each risk group just to try
  let records = value;

  const nodeCategory = R.partial(nodeCategoryRaw, [selectedKey]);

  let f = d3.format(".3f");

  let assortativity = R.map((record) => {
    const r = { "Record" : record, 
                "Field" : selectedKey, 
                "DWH" : f(dwh(network, nodeCategory , record)),
                "Panmictic range" : d3.extent(R.map ((r) => f(dwh(network, nodeCategory, record, true)), R.range (1, 200)))};
    return r;
  }, records);

  let fractions = computeFractions(network, nodeCategory, false);

  return { 
            'field' : selectedKey,
            'fractions' : fractions,
            'assortativity' : assortativity,
          };

}

// Read in all patient_attributes and get unique list
let patientAttributeKeys = R.filter(k=> k != "ehars_uid", R.keys(network.Nodes[0].patient_attributes));
let patientAttributes = R.zipObj(patientAttributeKeys, R.map(key => R.uniq(R.map(d => { try { return d.patient_attributes[key]} catch { return null } }, network.Nodes)), patientAttributeKeys));

let results = R.mapObjIndexed(getAssortativities, patientAttributes);


fs.writeFileSync(options.output, JSON.stringify(results, null, 2));

