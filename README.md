# rhtmlSankeyTree

> Sankey Diagrams as Collapsible Trees

Combining Sankey diagrams with collapsible trees and adding some new
interactivity might help us analyze, instruct, and decide.

# Installation in R

## Important
This package uses a customised htmlwidget package that allows local state saving. The official htmlwidget package will not work. Download the customised package by running install_github('Displayr/htmlwidgets')

## Installation
1. `library(devtools)`
1. `install_github('Displayr/htmlwidgets')`
1. `install_github('Displayr/rhtmlSankeyTree')`

An example to verify installation:
```

library(rhtmlSankeyTree)

tree.list <- list(treeType = "Classification", name = "Overall", n = 726L, Percentage = "100%", id = 1, color = "#CC4242", nodeDistribution = c(0.00550964187327824, 0.0826446280991736, 0.261707988980716, 0.398071625344353, 0.214876033057851, 0.0358126721763085, 0.00137741046831956 ), overallDistribution = c(0.00550964187327824, 0.0826446280991736, 0.261707988980716, 0.398071625344353, 0.214876033057851, 0.0358126721763085, 0.00137741046831956), nodeVariables = c("1", "2", "3", "4", "5", "6", "7"), terminalDescription = "", children = list(list(name = "Fees: 1, 2, 3, 6", n = 429L, Percentage = "59%", id = 2, color = "#CC4E4E", nodeDistribution = c(0.00699300699300699, 0.123543123543124, 0.328671328671329, 0.375291375291375, 0.146853146853147, 0.0163170163170163, 0.00233100233100233 ), overallDistribution = c(0.00550964187327824, 0.0826446280991736, 0.261707988980716, 0.398071625344353, 0.214876033057851, 0.0358126721763085, 0.00137741046831956), nodeVariables = c("1", "2", "3", "4", "5", "6", "7"), terminalDescription = "", children = list(list(name = "Fees: 1, 2", n = 139L, Percentage = "19%", id = 4, color = "#59CC44", nodeDistribution = c(0.0215827338129496, 0.215827338129496, 0.359712230215827, 0.273381294964029, 0.122302158273381, 0.00719424460431655, 0), overallDistribution = c(0.00550964187327824, 0.0826446280991736, 0.261707988980716, 0.398071625344353, 0.214876033057851, 0.0358126721763085, 0.00137741046831956 ), nodeVariables = c("1", "2", "3", "4", "5", "6", "7"), terminalDescription = "Highest = 3"), list( name = "Fees: 3, 6", n = 290L, Percentage = "40%", id = 5, color = "#CC3434", nodeDistribution = c(0, 0.0793103448275862, 0.313793103448276, 0.424137931034483, 0.158620689655172, 0.0206896551724138, 0.00344827586206897 ), overallDistribution = c(0.00550964187327824, 0.0826446280991736, 0.261707988980716, 0.398071625344353, 0.214876033057851, 0.0358126721763085, 0.00137741046831956), nodeVariables = c("1", "2", "3", "4", "5", "6", "7"), terminalDescription = "Highest = 4"))), list(name = "Fees: 4, 5, 7", n = 297L, Percentage = "41%", id = 3, color = "#CC3030", nodeDistribution = c(0.00336700336700337, 0.0235690235690236, 0.164983164983165, 0.430976430976431, 0.313131313131313, 0.063973063973064, 0), overallDistribution = c(0.00550964187327824, 0.0826446280991736, 0.261707988980716, 0.398071625344353, 0.214876033057851, 0.0358126721763085, 0.00137741046831956 ), nodeVariables = c("1", "2", "3", "4", "5", "6", "7"), terminalDescription = "", children = list(list( name = "Fees: 4", n = 237L, Percentage = "33%", id = 6, color = "#CC1C1C", nodeDistribution = c(0, 0.0168776371308017, 0.172995780590717, 0.468354430379747, 0.29957805907173, 0.0421940928270042, 0), overallDistribution = c(0.00550964187327824, 0.0826446280991736, 0.261707988980716, 0.398071625344353, 0.214876033057851, 0.0358126721763085, 0.00137741046831956 ), nodeVariables = c("1", "2", "3", "4", "5", "6", "7"), terminalDescription = "Highest = 4"), list(name = "Fees: 5, 7", n = 60L, Percentage = "8%", id = 7, color = "#7091CC", nodeDistribution = c(0.0166666666666667, 0.05, 0.133333333333333, 0.283333333333333, 0.366666666666667, 0.15, 0), overallDistribution = c(0.00550964187327824, 0.0826446280991736, 0.261707988980716, 0.398071625344353, 0.214876033057851, 0.0358126721763085, 0.00137741046831956 ), nodeVariables = c("1", "2", "3", "4", "5", "6", "7"), terminalDescription = "Highest = 5")))))

rhtmlSankeyTree::SankeyTree(tree.list, value = "n", nodeHeight = 100, numeric.distribution = TRUE, tooltip = "tooltip", terminalDescription = TRUE)

print(plt)
```

# Local Installation to Develop/Contribute

**Prerequisites** - For help installing prerequisites see the `Prequisite Installation Help` section below

1. nodejs >= 6.0
1. python 2.7 - one of the nodejs libraries needs python during the installation process

## Installing the rhtmlSankeyTree code

1. On windows open git shell (or install it first). On OSX open terminal
    1. Tim note : Type enter when prompted for a passphrase when opening git shell
1. Change directory to the place where you put git projects
    1. Tim note : Do not use a Dropbox synced directory. There will be 1000's of files created by `npm install` and your computer will catch fire
1. type `git clone git@github.com:Displayr/rhtmlSankeyTree.git` ENTER
1. type `cd rhtmlSankeyTree` ENTER
1. type `npm install` ENTER
    1. `npm install` is noisy and will print several warnings about `UNMET` and `DEPRECATED`. Ignore these and only make note of errors. If it fails, try running it again.
1. type `gulp serve` ENTER
    1. If `gulp serve` does not work try `./node_modules/.bin/gulp serve`. To correct this and to make your nodejs life easier you should add `./node_modules/.bin` to your PATH. Consult the Internet for instructions on how to do so on your OS of choice. 
    1. Auto-reload will be enabled with `gulp serve`, meaning that any changes saved to the specific files in folders `scripts`, `internal_www` and `styles` inside the `theSrc` folder will trigger an automatic browser reload.
1. If you do not wish to have auto-reload enabled, run `gulp serve_s` instead.

If this worked, then the `gulp serve` command opened your browser and you are looking at `http://localhost:9000`. You should see a page listing a bunch of links to examples. These examples are defined in the [internal www content directory](theSrc/internal_www/content).

## Prerequisite Installation Help

### Install nodejs on OSX

1. Install brew by following instructions here : http://brew.sh/
1. Install nvm (node version manager) by running `brew install nvm`
1. Install node by running `nvm install 6.1.0` on the terminal

### Install nodejs on Windows

1. Setup nodist. https://github.com/marcelklehr/nodist and find the link to the official installer.
1. Open the command prompt. Type: `nodist v6.1.0`
1. Type `node -v` and verify the version is correct

### Python on OSX - it should come installed. If not

1. Install brew (if not done already) by following instructions here : http://brew.sh/
1. Install python by running `brew install python` on the terminal - make sure you get 2.7

### Python on Windows

1. Download version 2.7 from https://www.python.org/downloads/

# Developing and Contributing

1. The last thing you do before committing is run `gulp build` to ensure all the autogenerated files are up to date.
2. DO NOT edit things in `browser`, `inst` and `man` folders as they are auto-generated and will be recompiled from `theSrc` folder when `gulp build` or `gulp serve` is called. It is safe to edit files in `R`, `theSrc`, `examples` and `data`.

# License

See the LICENSE file
GPL-3 + COPYRIGHT HOLDER: Displayr
