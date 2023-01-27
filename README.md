# DWH

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
$W_M$ : Weight of in-group connections
$W_C$ : Weight of out-group connections
$W_X$ : Weight of cross-group connections
$d_in$ : In-group degree
$d_out$ : Out-group degree
$nodes_in$ : number of in-group nodes
$nodes_out$ : number of out-group nodes

A DWH value of 0 indicates that there is no homophily, while a value of 1
indicates that there is perfect homophily.

DWH is used in social network analysis and in the study of how different
attributes are related to the formation of connections between individuals. It
is used as a way to measure the similarity of attributes between individuals in
a network.
