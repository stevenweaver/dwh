#!/usr/bin/env node

import { program } from 'commander';
import { default as dwh, computeFractions } from "../dist/dwh.es.js";
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
    console.log(`No patient attributes for ${n.id}`)
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
    '-r --record <record>',
    "The attribute of interest. For example, 'PWID (F)'"
  )
  .option(
    '-f --field <field>',
    "Field to inspect"
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

const nodeCategory = R.partial(nodeCategoryRaw, [options.field]);


console.log("DWH")
console.log(dwh(network, nodeCategory, options.record, options.randomize));

console.log("Computed Fractions")
const linkInfo = computeFractions(network, nodeCategory, false);
console.log(linkInfo);

