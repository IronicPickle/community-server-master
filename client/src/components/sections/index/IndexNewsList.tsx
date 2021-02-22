import React, { Component, MouseEvent } from "react";
import { withStyles, Theme, Paper, Grid, Typography, Toolbar, Divider, Button, Grow } from "@material-ui/core";
import { ClassNameMap } from "@material-ui/core/styles/withStyles";
import HTTPNewsPosts, { DBNewsPost } from "../../../http_utils/HTTPNewsPosts";
import AnnouncementIcon from "@material-ui/icons/Announcement";
import CreateNewsPost from "../containers/CreateNewsPost";
import DeleteNewsPost from "../containers/DeleteNewsPost";
import EditNewsPost from "../containers/EditNewsPost";
import { globalContext, GlobalContext } from "../../../utils/contexts";
import { authenticate } from "../../../utils/auth";
import NewsPost from "./NewsPost";

const styles = (theme: Theme) => ({
  mainContainer: {
    marginTop: theme.spacing(4),
    minHeight: theme.spacing(40),

    paddingRight: theme.spacing(4),
    paddingLeft: theme.spacing(4),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(4)
  },
  titleContainer: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(3)
  },
  titleIcon: {
    width: theme.spacing(6),
    height: theme.spacing(6)
  },
  cardParentContainer: {
    marginTop: theme.spacing(4),
    maxWidth: "inherit"
  },
  cardContainer: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    backgroundColor: theme.palette.primary.dark
  },
  postTitle: {
    marginBottom: theme.spacing(2),

    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(4),
    border: 1,
    borderStyle: "none none none solid",
    borderColor: theme.palette.secondary.main
  },
  postBody: {
    marginBottom: theme.spacing(2)
  },
  postFooter: {
    marginTop: theme.spacing(2)
  },
  postAuthorAvatar: {
    width: theme.spacing(8),
    height: theme.spacing(8)
  },
  postDetails: {
    padding: 0,
    marginLeft: theme.spacing(2)
  }
});

interface Props {
  classes: ClassNameMap;
}

interface State {
  newsPosts: DBNewsPost[];
  newsPostsTotal: number;
  createState: boolean;
  editState: boolean;
  deleteState: boolean;
  currentNewsPost: DBNewsPost;
}

class IndexNewsList extends Component<Props, State> {  
  static contextType = globalContext;

  constructor(props: Props) {
    super(props);

    this.state = {
      newsPosts: [],
      newsPostsTotal: 0,
      createState: false,
      editState: false,
      deleteState: false,
      currentNewsPost: {} as DBNewsPost
    }

    this.updateNewsPosts = this.updateNewsPosts.bind(this);
    this.pageScroll = this.pageScroll.bind(this);
    this.openCreate = this.openCreate.bind(this);
    this.openEdit = this.openEdit.bind(this);
    this.openDelete = this.openDelete.bind(this);
  }


  async updateNewsPosts(snipLimit?: number) {
    if(snipLimit == null) snipLimit = 10;
    const res = await HTTPNewsPosts.query({ snipStart: 0, snipLimit: snipLimit, sortDirection: -1, sortKey: "datePosted"});
    if(!res.success || res.data == null) return;
    this.setState({ newsPosts: res.data.newsPosts, newsPostsTotal: res.data.count })
  }

  private root = document.getElementById("root");

  pageScroll() {
    if(this.root == null) return;
    const scrollPos = this.root.scrollTop;
    const maxScroll = this.root.scrollHeight - this.root.clientHeight;
    if(scrollPos === maxScroll) {
      const snipLimit = Math.ceil((this.state.newsPosts.length + 10) / 10) * 10;
      if(snipLimit < Math.ceil((this.state.newsPostsTotal + 10) / 10) * 10) this.updateNewsPosts(snipLimit);
    }
  }

  openCreate() {
    this.setState({ createState: true });
  }

  openEdit(newsPost: DBNewsPost) {
    return (event: MouseEvent<HTMLButtonElement>) => {
      this.setState({ editState: true, currentNewsPost: newsPost });
    }
  }

  openDelete(newsPost: DBNewsPost) {
    return (event: MouseEvent<HTMLButtonElement>) => {
      this.setState({ deleteState: true, currentNewsPost: newsPost });
    }
  }

  componentDidMount() {
    this.root?.addEventListener("scroll", this.pageScroll, false);
    this.updateNewsPosts();
  }
  
  componentWillUnmount() {
    this.root?.removeEventListener("scroll", this.pageScroll);
  }

  render() {
    const { classes } = this.props;
    const { newsPosts, createState, editState, deleteState, currentNewsPost } = this.state;
    const { memberData } = this.context as GlobalContext;

    return (
      <>
        <CreateNewsPost state={createState} onClose={() => {
          this.setState({ createState: false });
          this.updateNewsPosts();
        }} />
        <EditNewsPost state={editState} onClose={() => {
          this.setState({ editState: false });
          this.updateNewsPosts();
        }} inputs={currentNewsPost} />
        <DeleteNewsPost state={deleteState} onClose={() => {
          this.setState({ deleteState: false });
          this.updateNewsPosts();
        }} inputs={currentNewsPost} />
        <Paper className={classes.mainContainer} elevation={24}>
          <Toolbar className={classes.titleContainer}>
            <Grid container justify="flex-start">
              <Toolbar style={{ padding: 0 }}>
                <AnnouncementIcon className={classes.titleIcon}/>
              </Toolbar>
            </Grid>
            <Grid container justify="center">
              <Toolbar style={{ padding: 0 }}>
                <Typography
                  variant="h4"
                  component="h1"
                  align="center"
                  noWrap
                >
                  What's New?
                </Typography>
              </Toolbar>
            </Grid>
            <Grid container justify="flex-end">
              { authenticate("create-newspost", memberData) &&
                <Toolbar style={{ padding: 0 }}>
                  <Button
                    type="button"
                    color="secondary"
                    size="medium"
                    variant="outlined"
                    onClick={this.openCreate}
                    className={classes.button}
                  >Create News Post</Button>
                </Toolbar> }
            </Grid>
          </Toolbar>
          <Divider />
          <Grid container direction="column" alignContent="center">
            { newsPosts.length > 0 &&
              (
                newsPosts.map((newsPost, i) => {
                  let timeout = (i - (newsPosts.length - 11)) * 250;
                  if(timeout < 0) timeout = 0;
                  return (
                    <Grow key={i} in={true} timeout={timeout}>
                      <div>
                        <NewsPost newsPost={newsPost} onEdit={this.openEdit} onDelete={this.openDelete} />
                      </div>
                    </Grow>
                  )
                })
              )
            }
          </Grid>
        </Paper>
      </>
    );
  }
}

export default withStyles(styles)(IndexNewsList);