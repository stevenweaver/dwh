# DWH

## Overview

Degree-weighted homophily (DWH) is a measure of similarity between nodes in a
network based on their attributes (such as demographic characteristics or
behaviors) and their degree (i.e., the number of connections they have to other
nodes in the network). It is used to quantify the extent to which nodes with
similar attributes tend to be connected to each other more frequently than
would be expected by chance.

DWH is calculated as the ratio of the observed number of connections between
nodes with similar attributes to the expected number of connections between
such nodes, based on their degree.

In mathematical terms, it is defined as:
$DWH = (W_M + W_C - 2*W_X) / (d_in/nodes_in/nodes_in + d_out/nodes_out/nodes_out )$

Where:
* $W_M$ : Weight of in-group connections
* $W_C$ : Weight of out-group connections
* $W_X$ : Weight of cross-group connections
* $d_in$ : In-group degree
* $d_out$ : Out-group degree
* $nodes_in$ : number of in-group nodes
* $nodes_out$ : number of out-group nodes

A DWH value of 0 indicates that there is no homophily, while a value of 1
indicates that there is perfect homophily.

DWH is used in social network analysis and in the study of how different
attributes are related to the formation of connections between individuals. It
is used as a way to measure the similarity of attributes between individuals in
a network.

## Usage

"compute_dwh" takes four arguments:

* `network`: A network JSON that is the result from the [HIV-TRACE](https://github.com/veg/hivtrace) package. Additionally, the results from hivtrace must be annotated using `hivnetworkannotate` from the [hivclustering](https://github.com/veg/hivclustering) package.
* `binby`: A function that is used to bin the nodes in the network into different groups based on a specific attribute. An example function can be found in bin/dws.js.
* `value`: This argument is the value that is used to filter the nodes in the network. The function "binby" is applied to each node in the network, and the nodes are filtered based on whether the result of this function is equal to the value provided. For example, if one wants to know the homophily attribute "IDU", this argument would be "IDU"
* `randomize`: This argument is a Boolean value that determines whether the nodes in the network will be shuffled randomly before the computation of DWH. If the value is true, the nodes will be shuffled, and if the value is false, the nodes will not be shuffled. This is to determine the null distribution.


