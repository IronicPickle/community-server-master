import React, { Component } from "react";
import { Paper, Typography, Theme, withStyles, Tooltip, Divider, Grid, Select, MenuItem, TextField, Button, Grow, IconButton } from "@material-ui/core";
import { GlobalContext, globalContext } from "../../../utils/contexts";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import CloseIcon from "@material-ui/icons/Close";
import SkipNextIcon from "@material-ui/icons/SkipNext";
import { authenticate } from "../../../utils/auth";
import { ClassNameMap } from "@material-ui/core/styles/withStyles";

const styles = (theme: Theme) => ({
  mainContainer: {
    marginTop: theme.spacing(1),
    padding: theme.spacing(2)
  }, urlSubmitContainer: {
  }, urlSubmitTitle: {
    position: "absolute" as "absolute"
  }, urlOptionDropdown: {
    minWidth: theme.spacing(16),
    marginTop: theme.spacing(2),
    marginRight: theme.spacing(2)
  }, urlSubmitInput: {
    minWidth: theme.spacing(32)
  }, urlSubmitButton: {
    marginLeft: theme.spacing(2)
  },
  queueContainer: {
    marginTop: theme.spacing(2)
  }, queueTitle: {
    position: "absolute" as "absolute"
  }, queueButton: {
    marginTop: theme.spacing(1)
  }, queueGridContainer: {
    marginTop: theme.spacing(2)
  }, queueItem: {
    width: "25%"
  }, queueItemImg: {
    width: "100%",
    paddingBottom: "56.25%",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundSize: "cover",
    borderRadius: 10
  }, otherButtons: {
    position: "absolute" as "absolute",
    marginTop: theme.spacing(0.5),
    marginLeft: theme.spacing(4.5)
  }, queueSpliceButton: {
    position: "absolute" as "absolute",
    marginTop: theme.spacing(0.5),
    marginLeft: theme.spacing(0.5)
  },

  divider: {
    marginTop: theme.spacing(2)
  }
});

interface Props {
  classes: ClassNameMap;
  theme: Theme;
  parent: any;
}

class FooterContainer extends Component<Props> {
  static contextType = globalContext;

  constructor(props: Readonly<Props>) {
    super(props);

    this.onUrlSubmit = this.onUrlSubmit.bind(this);
    this.onClear = this.onClear.bind(this);
    this.onSplice = this.onSplice.bind(this);
    this.onSkipTo = this.onSkipTo.bind(this);

    this.onUrlOptionSelect = this.onUrlOptionSelect.bind(this);
    this.onUrlChange = this.onUrlChange.bind(this);
  }

  onUrlOptionSelect(event: React.ChangeEvent<{ name?: string; value: unknown }>) {
    const parent = this.props.parent;
    const selectedUrlOption = String(event.target.value);

    parent.setState({ selectedUrlOption });
  }

  onUrlChange(event: React.ChangeEvent<HTMLInputElement>) {
    const parent = this.props.parent;

    parent.setState({inputUrl: event.target.value});
  }

  onUrlSubmit(event: React.FormEvent<HTMLFormElement>) {
    const parent = this.props.parent;

    event.preventDefault();
    parent.pushUpdate(parent.state.selectedUrlOption, {url: parent.state.inputUrl});
    parent.setState({inputUrl: ""});
  }

  onClear(event: React.MouseEvent) {
    const parent = this.props.parent;

    parent.pushUpdate("clear", {});
  }

  onSplice(index: number) {
    return (event: React.MouseEvent) => {
      const parent = this.props.parent;

      parent.pushUpdate("splice", { index });
    }
  }

  onSkipTo(index: number) {
    return (event: React.MouseEvent) => {
      const parent = this.props.parent;

      parent.pushUpdate("skip-to", { index });
    }
  }

  render() {
    const { classes, theme, parent } = this.props;
    const { selectedInstance, instanceData, selectedUrlOption, inputUrl } = parent.state;
    const { memberData } = this.context as GlobalContext;

    const queue = parent.getQueue();

    return (
      <>
        {(selectedInstance) ?
            <Paper className={classes.mainContainer}>
              <div className={classes.urlSubmitContainer}>
                <Typography
                  variant="subtitle2"
                  component="p"
                  className={classes.urlSubmitTitle}
                >Submit a YouTube URL</Typography>
                <form name="urlSubmitForm" onSubmit={this.onUrlSubmit}>
                  <Grid container direction="row" alignItems="center" justify="center">
                    <Grid item>
                      <Select
                        labelId="url-option-select"
                        displayEmpty={true}
                        value={selectedUrlOption}
                        onChange={this.onUrlOptionSelect}
                        className={classes.urlOptionDropdown}
                      >
                        <MenuItem key="queue" value="queue" disabled={!authenticate("musicbot-queue", memberData)}>Queue</MenuItem>
                        <MenuItem key="queue-playlist" value="queue-playlist" disabled={!authenticate("musicbot-queue-playlist", memberData)}>Queue-Playlist</MenuItem>
                        <MenuItem key="play" value="play" disabled={!authenticate("musicbot-play", memberData)}>Play</MenuItem>
                      </Select>
                        <TextField
                          id="url-input"
                          label="YouTube URL"
                          type="string"
                          value={inputUrl}
                          onChange={this.onUrlChange}
                          className={classes.urlSubmitInput}
                        />
                        <Button
                          type="submit"
                          color="primary"
                          size="small"
                          variant="contained"
                          className={classes.urlSubmitButton}
                        >Submit</Button>
                    </Grid>
                  </Grid>
                </form>
              </div>
              <Divider className={classes.divider} />
              {
                (queue.length > 0) ?
                  <div className={classes.queueContainer}>
                    <Typography
                      variant="subtitle2"
                      component="p"
                      className={classes.queueTitle}
                    >Queue</Typography>
                    <Grid container direction="row" alignItems="center" justify="center">
                      <Grid item>
                        <Button
                          type="submit"
                          color="primary"
                          size="small"
                          variant="contained"
                          onClick={this.onClear}
                          className={classes.queueButton}
                          disabled={!authenticate("musicbot-clear", memberData)}
                        >Clear Queue</Button>
                      </Grid>
                    </Grid>
                    <Grid container spacing={2} direction="row" className={classes.queueGridContainer}>
                      {
                        queue.map((queueItem: any, i: number) => {
                          const snippet = queueItem.snippet;
                          const thumbnails = snippet.thumbnails;
                          const entryIsPlaying = instanceData.queuePos === i;
                          return (thumbnails) ?
                            <Grow key={`queueItem-${i}`} in={true} timeout={Math.log2(i) * 500}>
                              <Grid item className={classes.queueItem}>
                                <IconButton
                                  onClick={this.onSplice(i)}
                                  size="small" color="secondary"
                                  aria-label="splice entry from queue"
                                  className={classes.queueSpliceButton}
                                >
                                  <Tooltip title={"Splice Entry"} placement="top" PopperProps={{ disablePortal: true }}>
                                    <CloseIcon
                                      style={{
                                        color: theme.palette.secondary.main
                                      }}
                                      fontSize="large"
                                    />
                                  </Tooltip>
                                </IconButton>
                                {
                                  (entryIsPlaying) ?
                                    <IconButton
                                      size="small"
                                      color="secondary"
                                      aria-label="now playing"
                                      className={classes.otherButtons}
                                    >
                                      <Tooltip title="Now Playing" placement="top" PopperProps={{ disablePortal: true }}>
                                        <PlayArrowIcon
                                          style={{
                                            color: theme.palette.success.main
                                          }}
                                          fontSize="large"
                                        />
                                      </Tooltip>
                                    </IconButton>
                                  :
                                    <IconButton
                                      onClick={this.onSkipTo(i)}
                                      size="small"
                                      color="secondary"
                                      aria-label="splice to specific entry"
                                      className={classes.otherButtons}
                                    >
                                    <Tooltip title={"Skip To"} placement="top" PopperProps={{ disablePortal: true }}>
                                      <SkipNextIcon
                                        style={{
                                          color: (!entryIsPlaying) ?
                                            theme.palette.secondary.main
                                          :
                                            theme.palette.primary.light
                                        }}
                                        fontSize="large"
                                      />
                                    </Tooltip>
                                  </IconButton>
                                }
                                
                                <a href={queueItem.url} target="_blank" rel="noopener noreferrer">
                                  <Tooltip title={snippet.title} placement="top" PopperProps={{ disablePortal: true }}>
                                    <div
                                      style={{
                                        backgroundImage: `url(${(thumbnails.standard) ? thumbnails.standard.url : "/images/no_thumbnail.png"})`,
                                        boxShadow: (entryIsPlaying) ? `0 0 10px ${theme.palette.success.main}` : ""
                                      }}
                                      className={classes.queueItemImg}
                                    />
                                  </Tooltip>
                                </a>
                              </Grid>
                            </Grow>
                          : null
                        })
                      }
                    </Grid>
                    <Divider className={classes.divider} />
                  </div>
                : null
              }
            </Paper>
          : null}
      </>
    )
  }
}

export default withStyles(styles, { withTheme: true })(FooterContainer);