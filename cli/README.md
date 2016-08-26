# FIWARE TourGuide CLI and helper scripts #

This directory contains the helper scripts needed for the different commands and subcommands available through the `tour-guide` CLI script.  Each of these scripts defines the following functions:

* For commands:
    * module_help
    * module_options
    * module_cmd
* For subcommands
    * submodule_help
    * submodule_options
    * submodule_cmd

The main `tour-guide` script sources the command script requested and executes the `module_cmd` function.  For subcommands, the corresponding command script sources the subcommand script and executes the `submodule_cmd` function.

## Commands ##

Each command has its own parameters and help message.  Use `tour-guide <command> --help` to get help about a specific `<command>`.  If a command has subcommands, use `tour-guide <command> <subcommand> --help` to get help about that specific `<subcommand>`.

The following commands are available:

### check ###

### configure ###

#### configure cygnus ####

#### configure keyrock ####

#### configure oauth ####

### load ###

Load sample data for TourGuide-App (restaurants, reservations and reviews).

#### load restaurants ####

Load sample restaurants for TourGuide-App.

#### load reservations ####

Create sample reservations for the restaurants available on TourGuide-App.

#### load reviews ####

Create sample reviews for the restaurants available on TourGuide-App.

### oauth-token ###

### sensors ###

#### sensors create ####

#### sensors update ####

#### sensors send-data ####

#### sensors simulate-data ####

### start ###

### stop ###
