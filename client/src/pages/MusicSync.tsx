import React, { Component } from "react";
import { withStyles, Theme, Container } from "@material-ui/core";
import Notification from "../components/sections/musicSync/Notification";
import { Classes } from "@material-ui/styles/mergeClasses/mergeClasses";
import { GlobalContext } from "../utils/contexts";
import io from "socket.io-client";
import HeaderContainer from "../components/sections/musicSync/HeaderContainer";
import PlayerContainer from "../components/sections/musicSync/PlayerContainer";
import ControlsContainer from "../components/sections/musicSync/ControlsContainer";
import FooterContainer from "../components/sections/musicSync/FooterContainer";
import { parseCookies } from "../utils/auth";

const styles = (theme: Theme) => ({
  mainContainer: {
    marginTop: theme.spacing(12),
    marginBottom: theme.spacing(8)
  }, headerContainer: {
    height: 50,
    padding: 0
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
}

interface StateI {
  socket: SocketIOClient.Socket | null;
  player?: YT.Player;
  notifyInfo: {
    open: boolean,
    message: string,
    type: "success" | "info" | "warning" | "error" | undefined ,
    autoHide?: boolean
  },
  instances: any,
  selectedInstance: string,
  selectedInstanceData: any,
  trackPosition: number,
  volumePosition: number,
  selectedUrlOption: string,
  inputUrl: string,
  playerVolume: boolean,
  playerVolumePosition: number
}

class MusicSync extends Component<PropsI, StateI> {
  static contextType = GlobalContext;

  private seekMoving: boolean;
  private volumeMoving: boolean;
  private intervals: any;
  private globalOffset: number;
  private synced: boolean;
  private lastSent: number;
  
  constructor(props: Readonly<PropsI>) {
    super(props);
    this.state = {
      socket: null,
      notifyInfo: {
        open: true,
        message: "Loading Youtube Player...",
        type: "info"
      },
      instances: null,
      selectedInstance: "",
      selectedInstanceData: {},
      volumePosition: 0,
      trackPosition: 0,
      selectedUrlOption: "queue",
      inputUrl: "",
      playerVolume: false,
      playerVolumePosition: 0
    }

    this.seekMoving = false;
    this.volumeMoving = false;
    this.intervals = [];
    this.globalOffset = 0;
    this.synced = false;
    this.lastSent = 0;

    this.socketSetup = this.socketSetup.bind(this);

    this.requestUpdate = this.requestUpdate.bind(this);
    this.pushUpdate = this.pushUpdate.bind(this);

    this.onNotificationClose = this.onNotificationClose.bind(this);

    this.getQueue = this.getQueue.bind(this);
    this.getCurrentTrack = this.getCurrentTrack.bind(this);
  }

  componentWillUnmount() {
    for(const i in this.intervals) {
      window.clearTimeout(this.intervals[i]);
    }
  }

  socketSetup(player: YT.Player) {
    this.componentWillUnmount();
    this.setState({socket: io("/musicsync"), player: player, notifyInfo:
      { open: true, message: "Established Socket Connection...", type: "info" }
    });
    this.intervals.push(window.setInterval(() => {
      this.requestUpdate({ global: false, uuid: this.state.selectedInstance });
    }, 1000 * 60 * 5))
    const socket: SocketIOClient.Socket | null = this.state.socket;

    if(!socket) return;
    socket.on("connect", () => {
      console.log("[Socket] Connected!");
      this.setState({notifyInfo:
        { open: true, message: "Requesting Bot Info...", type: "info" }
      });
      this.requestUpdate({ global: true });
    });
    socket.on("disconnect", () => {
      console.log("[Socket] Disconnected, Reconnecting...");
      this.setState({notifyInfo:
        { open: true, message: "Socket Disconnected, Reconnecting...", type: "error" }
      });
    });
    socket.on("updateRequired", (body: { data: {type: string, global: boolean}, uuid?: string }) => {
      console.log("[Socket] New update available!");
      if(body.data.global || body.uuid === this.state.selectedInstance)
      if([ "seek", "restart", "trackStart" ].includes(body.data.type)) this.synced = false;
      this.requestUpdate({
        global: body.data.global,
        uuid: body.uuid
      });
    });
    socket.on("updateResponse", (body: { global: boolean, uuid?: string, data: any }) => {
      if(body.global) {
        this.setState({ instances: body.data,
          notifyInfo: { open: false, message: "", type: "info" }
        });
        if(this.state.selectedInstance) {
          this.requestUpdate({ global: false, uuid: this.state.selectedInstance })
        }
      } else {
        if(body.uuid === this.state.selectedInstance) {
          const state: any = { selectedInstanceData: body.data };
          if(!this.seekMoving) state.trackPosition = body.data.currentTrack.position;
          if(!this.volumeMoving) state.volumePosition = body.data.volume;
          this.lastSent = parseInt(body.data.sent);
          this.setState(state);
        }
      }
      if(!this.state.selectedInstanceData.isPlaying || this.synced) this.context.toggleLoader(false);
    });
    socket.on("notify", (body: {message: string, type?: "success" | "info" | "warning" | "error" }) => {
      this.setState({notifyInfo:
        { open: true, message: body.message, type: body.type, autoHide: (body.type !== "info") }
      });
    });
  }

  requestUpdate(body: { global: boolean, uuid?: string, sent?: number }) {
    this.context.toggleLoader(true);
    body.sent = new Date().getTime();
    this.state.socket?.emit("requestUpdate", body);
  }

  pushUpdate(type: string, data: any) {
    if(!this.state.selectedInstance) {
      this.setState({notifyInfo:{ open: true, message: "You must select an instance to do that", type: "error" }});
      return;
    }
    this.context.toggleLoader(true);
    this.state.socket?.emit("pushUpdate", {
      type,
      data,
      uuid: this.state.selectedInstance,
      token: parseCookies().token
    });
  }

  onNotificationClose() {
    this.setState({notifyInfo:
      { open: false, message: "", type: "info" }
    });
  }

  

  getQueue() {
    const selectedInstanceData = this.state.selectedInstanceData;
    return selectedInstanceData.queue || [];
  }

  getCurrentTrack() {
    const selectedInstanceData = this.state.selectedInstanceData;
    const queue = this.getQueue();

    var currentTrack: any = {};
    
    if(selectedInstanceData.currentTrack) {
      currentTrack = { ...currentTrack, ...selectedInstanceData.currentTrack };
    }
    if(queue.length > 0) {
      currentTrack = { ...currentTrack, ...queue[selectedInstanceData.queuePos] };
    }

    return currentTrack;
  }
  
  render() {
    const { classes } = this.props;
    const { notifyInfo } = this.state;

    return (
      <div>
        <Notification
          open={notifyInfo.open}
          type={notifyInfo.type}
          message={notifyInfo.message}
          autoHide={notifyInfo.autoHide}
          onClose={this.onNotificationClose}          
        />
        <Container className={classes.mainContainer}>
          <HeaderContainer parent={this} />
          <PlayerContainer parent={this} />
          <ControlsContainer parent={this} />
          <FooterContainer parent={this} />
        </Container>
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(MusicSync);