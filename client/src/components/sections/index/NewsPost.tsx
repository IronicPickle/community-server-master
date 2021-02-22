import React, { Component, MouseEvent } from "react";
import { withStyles, Theme, Grid, Typography, Toolbar, Divider, IconButton, Tooltip, Card, CardContent, Container, Avatar } from "@material-ui/core";
import { ClassNameMap } from "@material-ui/core/styles/withStyles";
import { DBNewsPost } from "../../../http_utils/HTTPNewsPosts";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import moment from "moment";
import { globalContext, GlobalContext } from "../../../utils/contexts";
import { authenticate } from "../../../utils/auth";
import MarkdownIt from "markdown-it";

const styles = (theme: Theme) => ({
  mainContainer: {
    marginTop: theme.spacing(4),
    minHeight: theme.spacing(40),

    paddingRight: theme.spacing(4),
    paddingLeft: theme.spacing(4),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2)
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
  newsPost: DBNewsPost;
  onEdit: (server: DBNewsPost) => (event: MouseEvent<any>) => any;
  onDelete: (server: DBNewsPost) => (event: MouseEvent<any>) => any;
}

interface State {

}

class NewsPost extends Component<Props, State> {  
  static contextType = globalContext;

  constructor(props: Props) {
    super(props);

    this.state = {}

  }

  render() {
    const { classes, newsPost, onEdit, onDelete } = this.props;
    const { memberData } = this.context as GlobalContext;

    return (
      <>
        <Container className={classes.cardParentContainer}>
          <Card elevation={12} className={classes.cardContainer}>
            <CardContent>
              <Typography
                variant="h4"
                component="h1"
                noWrap
                className={classes.postTitle}
              >{ newsPost.title }
              </Typography>
              
              <Typography                       
                variant="body1"
                component="p"
                className={classes.postBody}
                dangerouslySetInnerHTML={{
                  __html: new MarkdownIt().render(newsPost.body)
                }}
              ></Typography>
              <Divider />
              <Toolbar disableGutters className={classes.postFooter}>
                <Tooltip title={newsPost.author?.discordName || "Unknown"}>
                  <Avatar
                    src={newsPost.author?.discordAvatar}
                    alt="News Post Avatar"
                    className={classes.postAuthorAvatar}
                  />
                </Tooltip>
                  
                <div className={classes.postDetails}>
                  <Typography
                    variant="body1"
                    component="p"
                    noWrap
                  >{newsPost.author?.discordName || "Unknown"}
                  </Typography>

                  <Tooltip
                    title={moment(new Date(newsPost.datePosted)).format("HH:mm - DD/MM/YYYY")}
                    PopperProps={{ disablePortal: true }}
                  >
                    <Typography
                      variant="body2"
                      component="p"
                      color="secondary"
                      noWrap
                    >{moment(new Date(newsPost.datePosted)).fromNow()}
                    </Typography>
                  </Tooltip>
                </div>
                <Grid container justify="flex-end">
                  { authenticate("edit-newspost", memberData) &&
                  <Tooltip
                      title="Edit Post"
                      PopperProps={{ disablePortal: true }}
                    >
                      <IconButton
                        onClick={onEdit(newsPost)}
                      >
                        <EditIcon />
                        </IconButton>
                      </Tooltip> }
                    { authenticate("delete-newspost", memberData) &&
                    <Tooltip
                      title="Delete Post"
                      PopperProps={{ disablePortal: true }}
                    >
                      <IconButton
                        onClick={onDelete(newsPost)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip> }
                </Grid>
              </Toolbar>
            </CardContent>
          </Card>
        </Container>
      </>
    );
  }
}

export default withStyles(styles)(NewsPost);