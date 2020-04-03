import React, { Component } from "react";
import { Paper, Typography, Theme, withStyles, Fade, Collapse, Box } from "@material-ui/core";
import { Classes } from "@material-ui/styles/mergeClasses/mergeClasses";
import { GlobalContext } from "../../../utils/contexts";
import YouTube from "react-youtube";

const styles = (theme: Theme) => ({
  mainContainer: {
    position: "relative" as "relative",
    minHeight: theme.spacing(2.5),
    marginTop: theme.spacing(1),
    padding: theme.spacing(2)
  }, wrapper: {
    position: "relative" as "relative",
    width: "100%",
    height: 0,
    padding: 0,
    paddingBottom: "56.25%"
  }, player: {
    position: "absolute" as "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%"
  }, cover: {
    position: "absolute" as "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%"
  }, message: {
    position: "absolute" as "absolute",
    right: 0,
    left: 0,
    textAlign: "center" as "center"
  }
});

interface PropsI {
  classes: Classes;
  theme: Theme;
  parent: any;
}

class PlayerContainer extends Component<PropsI> {
  static contextType = GlobalContext;

  private intervals: any = [];

  constructor(props: Readonly<PropsI>) {
    super(props);

    this.onPlayerReady = this.onPlayerReady.bind(this);
    this.onStateChange = this.onStateChange.bind(this);
    this.playerSyncer = this.playerSyncer.bind(this);
    this.seekUpdater = this.seekUpdater.bind(this);

    this.intervals = [];
  }

  onPlayerReady(event: YT.PlayerEvent) {
    console.log("[Player] Player ready!");
    const parent = this.props.parent;
    const player = event.target;

    player.mute();
    parent.socketSetup(player);
    this.seekUpdater();
    parent.setState({ playerVolumePosition: player.getVolume() });
  }

  onStateChange(data: any) {
    if(data.data === 1) {
      this.playerSyncer();
    }
  }

  playerSyncer() {
    const parent = this.props.parent;
    const ping = new Date().getTime() - parent.lastSent;
    const player = parent.state.player;
    const selectedInstanceData = parent.state.selectedInstanceData;

    for(const i in this.intervals) clearInterval(this.intervals[i]);

    if(player && selectedInstanceData.currentTrack && selectedInstanceData.isPlaying) {
      const playerTime = (player.getCurrentTime() * 1000);
      const queueTrackTime = selectedInstanceData.currentTrack.position + ping;
      let offsetTime = playerTime - queueTrackTime;
      if(isNaN(offsetTime)) {
        parent.requestUpdate({ global: false, uuid: parent.state.selectedInstance });
        return;
      }

      if(offsetTime > 50 || offsetTime < -50) {
        console.log(`[Player] Syncing... Player offset: ${offsetTime}`);
        player.mute();
        parent.synced = true
        parent.setState({ notifyInfo:
          { open: true, message: "Attempting to sync...", type: "info" }
        });
        parent.synced = false;
        if(offsetTime > 50) parent.globalOffset -= 25;
        if(offsetTime < -50) parent.globalOffset += 25;
        if(offsetTime > 100) parent.globalOffset -= 50;
        if(offsetTime < -100) parent.globalOffset += 50;

        parent.requestUpdate({ global: false, uuid: parent.state.selectedInstance });
      } else {
        if(!parent.synced) {
          console.log("[Player] Successfully synced!");
          if(parent.state.playerVolume) player.unMute();
          parent.synced = true;
          this.context.toggleLoader(false);
          parent.setState({ notifyInfo:
            { open: true, message: "Successfully synced", type: "success", autoHide: true }
          });
        }
      }
    }
  }

  seekUpdater() {
    const parent = this.props.parent;

    parent.intervals.push(window.setInterval(() => {
      const player = parent.state.player;
      const currentTrack = parent.state.selectedInstanceData.currentTrack;
      if(player && currentTrack && !parent.seekMoving) {
  
        parent.setState({ trackPosition: parent.state.trackPosition + 500 });
      }
    }, 500));
  }

  render() {
    const { classes, parent } = this.props;
    const { selectedInstanceData, player } = parent.state;

    const queue = parent.getQueue();
    const currentTrack = parent.getCurrentTrack();

    const opts = {
      playerVars: {
        rel: 0 as 0,
        showinfo: 0 as 0,
        controls: 0 as 0
      }
    }

    if(queue.length > 0 && player && !parent.synced) {
        player.seekTo((currentTrack.position + parent.globalOffset) / 1000, true);
        player.playVideo();
        
        this.intervals.push(setTimeout(() => {
          console.log("[Player] Sync timeout, jumping...");
          this.playerSyncer();
        }, 5000));
    }

    return (
      <Paper className={classes.mainContainer} id="playerContainer">
        <Fade in={!selectedInstanceData.isPlaying}>
          <Typography
            variant="subtitle2"
            component="p"
            className={classes.message}
          >We don't have anything to display.</Typography>
        </Fade>
        <Collapse in={selectedInstanceData.isPlaying}>
          <Box className={classes.wrapper}>
            <YouTube
              videoId={currentTrack.id}
              opts={opts}
              onReady={this.onPlayerReady}
              onStateChange={this.onStateChange}
              className={classes.player}
            />
          </Box>
          <Box className={classes.cover}></Box>
        </Collapse>
      </Paper>
    )
  }
}

export default withStyles(styles, { withTheme: true })(PlayerContainer);