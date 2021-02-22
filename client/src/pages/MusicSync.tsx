import React, { Component } from "react";
import { withStyles, Theme, Container } from "@material-ui/core";
import { GlobalContext, globalContext } from "../utils/contexts";
import socketIo from "socket.io-client";
import HeaderContainer from "../components/sections/musicSync/HeaderContainer";
import PlayerContainer from "../components/sections/musicSync/PlayerContainer";
import ControlsContainer from "../components/sections/musicSync/ControlsContainer";
import FooterContainer from "../components/sections/musicSync/FooterContainer";
import { ClassNameMap } from "@material-ui/core/styles/withStyles";

const styles = (theme: Theme) => ({
  mainContainer: {
    marginTop: theme.spacing(12),
    paddingBottom: theme.spacing(8)
  }, headerContainer: {
    height: 50,
    padding: 0
  }
});

interface PropsI {
  classes: ClassNameMap;
  theme: Theme;
}

interface StateI {
  socket: SocketIOClient.Socket | null;
  player?: YT.Player;
  instances: any,
  selectedInstance: string,
  instanceData: any,
  trackPosition: number,
  volumePosition: number,
  selectedUrlOption: string,
  inputUrl: string,
  playerVolume: boolean,
  playerVolumePosition: number
}

class MusicSync extends Component<PropsI, StateI> {
  static contextType = globalContext;

  private seekMoving: boolean;
  private volumeMoving: boolean;
  private intervals: number[];
  private globalOffset: number;
  private synced: boolean;
  private lastSent: number;
  
  constructor(props: Readonly<PropsI>) {
    super(props);
    this.state = {
      socket: null,
      instances: null,
      selectedInstance: "",
      instanceData: {},
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

    this.getQueue = this.getQueue.bind(this);
    this.getCurrentTrack = this.getCurrentTrack.bind(this);
  }

  componentWillUnmount() {
    for(const i in this.intervals) {
      this.intervals.splice(parseInt(i), 1);
      window.clearTimeout(this.intervals[i]);
    }
    this.state.socket?.disconnect();
  }

  socketSetup(player: YT.Player) {
    const { toggleNotification, toggleLoader } = this.context as GlobalContext;
    this.componentWillUnmount();

    const socket = socketIo("/musicsync");
    this.registerSocketEvents(socket);

    toggleLoader(true);
    toggleNotification(true, { type: "info", message: "Connecting to Server..." });
    this.setState({ socket, player });

    this.intervals.push(window.setInterval(() => {
      this.requestUpdate({ global: false, uuid: this.state.selectedInstance });
    }, 1000 * 60 * 5))

  }

  registerSocketEvents(socket: SocketIOClient.Socket) {
    const { toggleNotification, toggleLoader } = this.context as GlobalContext;

    socket.on("connect", () => {
      console.log("[Socket] Connected!");
      toggleNotification(true, { type: "info", message: "Requesting Bot Info..." });
      this.requestUpdate({ global: true });
    });

    socket.on("disconnect", () => {
      console.log("[Socket] Disconnected, Reconnecting...");
      toggleNotification(true, { type: "info", message: "Lost Connection, Reconnecting..." });
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
        if(this.state.selectedInstance) {
          this.requestUpdate({ global: false, uuid: this.state.selectedInstance });
        }
        this.setState({ instances: body.data });
        toggleNotification(true, { type: "success", message: "Bot Info Received" });
      } else {
        if(body.uuid === this.state.selectedInstance) {
          const state: any = { instanceData: body.data };
          if(!this.seekMoving) state.trackPosition = body.data.currentTrack.position;
          if(!this.volumeMoving) state.volumePosition = body.data.volume;
          this.lastSent = parseInt(body.data.sent);
          this.setState(state);
        }
      }
      if(!this.state.instanceData.isPlaying || this.synced) this.context.toggleLoader(false);
    });

    socket.on("notify", (body: {message: string, type?: "success" | "info" | "warning" | "error" }) => {
      if(body.type === "error") this.setState({ selectedInstance: "", instanceData: {} });
      toggleLoader(false);
      toggleNotification(true, { type: body.type, message: body.message });
    });
  }

  requestUpdate(body: { global: boolean, uuid?: string, sent?: number }) {
    this.context.toggleLoader(true);
    body.sent = new Date().getTime();
    this.state.socket?.emit("requestUpdate", body);
  }

  pushUpdate(type: string, data: any) {
    const { toggleNotification } = this.context as GlobalContext;
    if(!this.state.selectedInstance) {
      return toggleNotification(true, { type: "error", message: "You must select an instance to do that" });
    }
    this.context.toggleLoader(true);
    this.state.socket?.emit("pushUpdate", {
      type,
      data,
      uuid: this.state.selectedInstance
    });
  }


  getQueue() {
    const instanceData = this.state.instanceData;
    return instanceData.queue || [];
  }

  getCurrentTrack() {
    const instanceData = this.state.instanceData;
    const queue = this.getQueue();

    var currentTrack: any = {};
    
    if(instanceData.currentTrack) {
      currentTrack = { ...currentTrack, ...instanceData.currentTrack };
    }
    if(queue.length > 0) {
      currentTrack = { ...currentTrack, ...queue[instanceData.queuePos] };
    }

    return currentTrack;
  }
  
  render() {
    const { classes } = this.props;
    const { instanceData } = this.state;

    return (
      <>
        <Container className={classes.mainContainer}>
          <HeaderContainer parent={this} />
          { instanceData != null && <PlayerContainer parent={this} /> }
          { instanceData != null && <ControlsContainer parent={this} /> }
          <FooterContainer parent={this} />
        </Container>
      </>
    );
  }
}

export default withStyles(styles, { withTheme: true })(MusicSync);