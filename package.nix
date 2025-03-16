{ pkgs ? import <nixpkgs> {}, displayrUtils }:

pkgs.rPackages.buildRPackage {
  name = "rhtmlSankeyTree";
  version = displayrUtils.extractRVersion (builtins.readFile ./DESCRIPTION); 
  src = ./.;
  description = ''Combining Sankey diagrams with collapsible trees and adding some new interactivity might help us analyze, instruct, and decide.'';
  propagatedBuildInputs = with pkgs.rPackages; [ 
    htmlwidgets
  ];
}
