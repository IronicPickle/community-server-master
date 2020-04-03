import React, { Component } from "react";
import { Paper, Typography, Toolbar, IconButton, Tooltip, Select, MenuItem, Theme, withStyles, Slider } from "@material-ui/core";
import { Classes } from "@material-ui/styles/mergeClasses/mergeClasses";
import { GlobalContext } from "../../../utils/contexts";
import VolumeOffIcon from "@material-ui/icons/VolumeOff";
import VolumeUpIcon from "@material-ui/icons/VolumeUp";

const styles = (theme: Theme) => ({
  toolbar: {
    minHeight: 50,
    padding: `0 ${theme.spacing(1)} 0 ${theme.spacing(1)}`,
  }, title: {

  }, playerVolumeButton: {
    marginLeft: theme.spacing(2)
  }, playerVolumeSlider: {
    marginLeft: theme.spacing(2),
    maxWidth: 100
  }, playerVolumePosition: {
    whiteSpace: "nowrap" as "nowrap",
    width: 40,
    textAlign: "center" as "center",
    marginRight: theme.spacing(1),
    marginLeft: theme.spacing(1)
  }, instanceDropdown: {
    position: "absolute" as "absolute",
    right: theme.spacing(2.5)
  },

  colorWash: {
    color: theme.palette.primary.contrastText + " !important",
    "&:before": {borderColor: theme.palette.secondary.main},
    "&:after": {borderColor: theme.palette.secondary.main}
  }
});

interface PropsI {
  classes: Classes;
  theme: Theme;
  parent: any;
}

class HeaderContainer extends Component<PropsI> {
  static contextType = GlobalContext;

  private volumeMoving: boolean = false;

  constructor(props: Readonly<PropsI>) {
    super(props);

    this.onTogglePlayerVolume = this.onTogglePlayerVolume.bind(this);
    this.onPlayerVolume = this.onPlayerVolume.bind(this);
    this.onPlayerVolumeChange = this.onPlayerVolumeChange.bind(this);
    this.onInstanceSelect = this.onInstanceSelect.bind(this);
  }

  onTogglePlayerVolume(event: React.MouseEvent) {
    const parent = this.props.parent;
    const player = parent.state.player;
    
    if(player) {
      if(!parent.state.playerVolume) {
        player.unMute()
      } else {
        player.mute();
      }
      parent.setState({playerVolume: !parent.state.playerVolume});
    }
  }

  onPlayerVolume() {
    const parent = this.props.parent;
    const player = parent.state.player;
    this.volumeMoving = false;

    player.setVolume(parent.state.playerVolumePosition);
  }

  onPlayerVolumeChange(event: React.ChangeEvent<{}>, value: number | number[]) {
    const parent = this.props.parent;

    this.volumeMoving = true;
    if(typeof value == "number") parent.setState({ playerVolumePosition: value })
  }

  onInstanceSelect(event: React.ChangeEvent<{ name?: string; value: unknown }>) {
    const parent = this.props.parent;
    parent.synced = false;

    if(!parent.state.instances) return;
    const selectedInstance = String(event.target.value);
    parent.setState({ selectedInstance });
    parent.requestUpdate({ global: false, uuid: selectedInstance })
  }

  render() {
    const { classes, parent } = this.props;

    const { instances, selectedInstance, selectedInstanceData, player, playerVolumePosition } = parent.state;

    return (
      <Paper className={classes.headerContainer}>
        <Toolbar className={classes.toolbar}>
          <Typography
            variant="subtitle2"
            component="p"
            className={classes.title}
          >{(selectedInstanceData.isPlaying) ? selectedInstanceData.currentTrack.title : "Nothing is Playing"}</Typography>
          {
            (player) ?
              <>
                <IconButton
                  onClick={this.onTogglePlayerVolume}
                  size="small"
                  color="secondary"
                  aria-label="toggle player sound"
                  className={classes.playerVolumeButton}
                >
                  {
                    (!parent.state.playerVolume) ?
                      <Tooltip title={"Unmute Player"} placement="top" PopperProps={{ disablePortal: true }}>
                        <VolumeOffIcon color="secondary" />
                      </Tooltip>
                    :
                      <Tooltip title={"Mute Player"} placement="top" PopperProps={{ disablePortal: true }}>
                        <VolumeUpIcon color="secondary" />
                      </Tooltip>
                  }
                </IconButton>
                {
                  (parent.state.playerVolume) ?
                    <>
                      <Slider
                        className={classes.playerVolumeSlider}
                        value={playerVolumePosition}
                        aria-labelledby="label"
                        onChange={this.onPlayerVolumeChange}
                        onChangeCommitted={this.onPlayerVolume}
                        color="secondary"
                      />
                      <Typography
                        variant="subtitle2"
                        component="p"
                        className={classes.playerVolumePosition}
                      >
                        {
                          playerVolumePosition
                        }
                      </Typography>
                    </>
                  : <></>
                }
              </>
            : <></>
          }
          <Select
            labelId="instance-select"
            displayEmpty={true}
            renderValue={() => {
              if(selectedInstance) { return selectedInstanceData.name || "Select an Instance"
              } else { return "Select an Instance" }
            }}
            value={selectedInstance}
            onChange={this.onInstanceSelect}
            className={`${classes.colorWash} ${classes.instanceDropdown}`}
          >
            {
              (instances) ?
                instances.map((instance: any, i: number) => {
                  return (instance.running) ?
                    <MenuItem key={instance.uuid} value={instance.uuid}>{instance.name}</MenuItem>
                  : <></>
                })
              :
                <MenuItem key="default" value="default">No Instances Available</MenuItem>
              
            }
          </Select>
        </Toolbar>
      </Paper>
    )
  }
}

export default withStyles(styles, { withTheme: true })(HeaderContainer);