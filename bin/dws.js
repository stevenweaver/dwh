#!/usr/bin/env node

import { program } from 'commander';
import { default as dwh } from "../dist/dwh.es.js";
import * as fs from 'fs'

var network;

// binBy:any, value:any, randomize:boolean

// binBy is a function that we will have to make static for the command line application 
let nodeCategory = (n) => {
  var desc = n['patient_attributes']['Risk'];
  if (desc == "MSM") {
    return desc; 
  }
  return desc + " (" + n['patient_attributes']['Gender'] + ")";
}

program
  .arguments("<network>", "Input network file")
  .action(cmd => {
    network = JSON.parse(fs.readFileSync(cmd));       
  })
  .option(
    '-r --record <record>',
    "The attribute of interest. For example, 'PWID (F)'"
  )
  .option(
    "-x --randomize",
    "Whether it should be randomized"
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

console.log(dwh(network, nodeCategory, options.record, options.randomize));
