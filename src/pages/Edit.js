import React, { Component } from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import { showMessage } from "react-native-flash-message";
import { Overlay } from 'react-native-elements';
import { Picker } from 'native-base';
import ImagePicker from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';
import UUIDGenerator from 'react-native-uuid-generator';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import { themes } from '../providers/themesProvider'
import moment from 'moment';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  TextInput,
  Image,
  StatusBar,
  ScrollView,
  Alert,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-navigation';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default class Edit extends Component {
  state = {
    title: '',
    shortDescription: '',
    priority: 'None',
    worktime: '',
    category: 'Application',
    tags: '',
    todoItem: '',
    date: moment().format('ddd, D[th] MMMM/YYYY'),
    todo: [],
    projects: [],
    estimatedTime: '',
    estimatedInterval: 'day(s)',
    doneTasks: 0,
    currentHeight: null,
    isVisible: false,
    visibleModal: false,
    updatedAt: moment(),
    imgViewerUri: '',
    previews: [],
    defaultCategory: true,
    showAlert: false,
    //onFocus
    project: {},
    titleLabel: false,
    descriptionLabel: false,
    tagsLabel: false,
    estimatedTimeLabel: false,
    categoryLabel: false,
    priorityLabel: false,
    projectId: null,
    themeKey: null,

  };

  static navigationOptions = {
    header: null,
  };

  componentDidMount = async () => {
    const key = this.props.navigation.getParam('themeKey', 'NO-THEME-KEY')
    this.setState({ themeKey: key })
    this.setState({ showAlert: true })
    const projectId = this.props.navigation.getParam('projectId', null);
    if (projectId !== null) {

      const data = await AsyncStorage.getItem('keyProjects');
      const projects = (await JSON.parse(data)) || [];
      await this.setState({
        projects: projects,
        projectId: projectId,
      });

      const detail = await this.state.projects.find(obj => obj.key === projectId);
      const todoDetail = await detail.todo;
      await this.setState({
        project: detail,
        todo: todoDetail,
      });

      await this.setState({
        title: this.state.project.title,
        shortDescription: this.state.project.shortDescription,
        tags: this.state.project.tags,
        estimatedTime: this.state.project.estimatedTime,
        estimatedInterval: this.state.project.estimatedInterval,
        worktime: this.state.worktime,
        category: this.state.project.category,
        priority: this.state.project.priority,
        previews: this.state.project.images,
      });
    } else {
      const data = await AsyncStorage.getItem('keyProjects');
      const projects = (await JSON.parse(data)) || [];
      await this.setState({
        projects: projects,
      });

    }
    this.setState({ showAlert: false })
  };

  deleteTodo(i) {
    const newTodoList = this.state.todo.filter((task, index) => index !== i)
    this.setState({
      todo: newTodoList
    })
  }

  deleteImage(i) {
    const newImages = this.state.previews.filter((imagePath, index) => index !== i)
    this.setState({
      previews: newImages
    })
  }

  addTodo = async () => {

    if (!this.state.todoItem) {
      Alert.alert(
        'Ops!',
        'This field is obligatory',
        [
          { text: 'OK' },
        ],
        { cancelable: false },
      );
      return
    }

    this.state.todo.push({
      task: this.state.todoItem,
      checked: false,
    });

    this.setState({
      todoItem: '',
    });
  };


  handleSelectImage = () => {

    const options = {
      title: 'Select picture',
      storageOptions: {
        skipBackup: true,
        quality: 0.1,
        path: 'myawesomeproject',
      },
    };

    ImagePicker.showImagePicker(options, response => {
      if (response.error) {
        console.log('Error');
      } else if (response.didCancel) {
        console.log('Used canceled');
      } else {
        this.state.previews.push(response.path);
        if (this.state.previews.length === 1) {
          showMessage({
            message: "Long press on image to delete it",
            type: "defautl",
          });
        }
        this.forceUpdate()
      }
    });
  }

  handleSubmit = async () => {


    if (!this.state.title || !this.state.shortDescription) {
      Alert.alert(
        'Ops!',
        'Title and description are obligatory',
        [
          { text: 'OK' },
        ],
        { cancelable: false },
      );
      return
    }

    const projectId = this.props.navigation.getParam('projectId', null);
    const {
      title,
      shortDescription,
      category,
      tags,
      priority,
      worktime,
      estimatedTime,
      estimatedInterval,
      images,
      date,
      todo,
      doneTasks,
      updatedAt
    } = this.state

    if (projectId !== null) {
      this.state.projects
        .filter(project => {
          return project.key === this.state.projectId
        })
        .map(project => {
          project.title = title
          project.shortDescription = shortDescription,
            project.category = category,
            project.tags = tags,
            project.worktime = estimatedTime + ' ' + estimatedInterval,
            project.priority = priority,
            project.updatedAt = moment()
        });

    } else {
      const updatedProject = {
        title,
        shortDescription,
        category,
        tags,
        priority,
        worktime,
        estimatedTime,
        estimatedInterval,
        images,
        key: await UUIDGenerator.getRandomUUID(),
        date,
        todo,
        isArchived: false,
        doneTasks,
        updatedAt: moment()
      }
      this.state.projects.unshift(updatedProject);

    }





    await AsyncStorage.setItem(
      'keyProjects',
      JSON.stringify(this.state.projects),
    );
    this.props.navigation.navigate('Dashboard', { isFirst: true });
  };

  goToDashBoard() {
    this.props.navigation.navigate('Dashboard', { isFirst: true });
  }

  render() {
    StatusBar.setBarStyle('light-content', true);
    const {
      title,
      shortDescription,
      category,
      tags,
      priority,
      worktime,
      estimatedTime,
      estimatedInterval,
      images,
      todo,
      isArchived,
      doneTasks,
      previews,
      defaultCategory,
      themeKey
    } = this.state
    return (
      themeKey &&
      <LinearGradient style={{ flex: 1 }} colors={[themes[themeKey].backgroundColor, themes[themeKey].backgroundColor, themes[themeKey].backgroundColor]}>
        <StatusBar backgroundColor={themes[themeKey].backgroundColor} barStyle="light-content" />
        <SafeAreaView style={{ flex: 1 }}>
          <Overlay
            height={200}
            overlayStyle={{ borderRadius: 10 }}
            onBackdropPress={() => {
              this.setState({
                isVisible: false
              })
            }}
            isVisible={this.state.isVisible}>
            <Text
              style={styles.fieldTitle}>
              New Category
            </Text>
            <View
              style={styles.overlayContainer}>
              <TextInput
                style={[styles.input, { flex: 10 }]}
                autoCorrect={false}
                placeholder="Add new category"
                placeholderTextColor="#999"
                onChangeText={category => this.setState({ category })}
              />
            </View>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={() => {
                this.setState({ isVisible: false })
              }}>
              <Text style={styles.shareButtonText}>Add</Text>
            </TouchableOpacity>
          </Overlay>

          <KeyboardAvoidingView style={{ flex: 1 }} behavior="height" enabled>
            <View style={{ backgroundColor: themes[themeKey].backgroundColor, flex: 1 }}>
              <LinearGradient colors={[themes[themeKey].backgroundColor, themes[themeKey].backgroundColor]}>
                <View style={styles.chevron}>
                  <TouchableOpacity
                    style={{ marginStart: 0 }} hitSlop={styles.hitSlop}
                    onPress={() => this.goToDashBoard()}>
                    <Icon name="chevron-left" size={45} color="#fff" solid />
                  </TouchableOpacity>
                </View>
                <Text
                  style={styles.headerTitle}>
                  {'Edit your info'}
                </Text>
              </LinearGradient>
              <ScrollView
                ref={(view) => {
                  this.scrollView = view;
                }}
              >

                <View style={[styles.container, { backgroundColor: themes[themeKey].backgroundColor }]}>
                  {this.state.showAlert ?
                    <View style={{ borderRadius: 10, marginTop: 20 }}>
                      <ShimmerPlaceHolder style={[styles.placeHolder, { height: 100 }]} autoRun={true} />
                      <ShimmerPlaceHolder style={[styles.placeHolder, { height: 150 }]} autoRun={true} />
                      <ShimmerPlaceHolder style={[styles.placeHolder, { height: 300 }]} autoRun={true} />
                      <ShimmerPlaceHolder style={[styles.placeHolder, { height: 250 }]} autoRun={true} />
                      <ShimmerPlaceHolder style={styles.placeHolder} autoRun={true} />
                    </View> :
                    <View>
                      <View style={{ padding: 20, borderRadius: 10, backgroundColor: '#fff' }}>
                        <Text
                          style={styles.fieldTitle}>
                          Required information
                                  </Text>

                        <Text style={[styles.labelTitle, { color: this.state.titleLabel === false ? '#4b4b4b' : themes[themeKey].accentColor }]}>
                          Project Name
                                  </Text>
                        <TextInput
                          style={styles.input}
                          autoCorrect={false}
                          onFocus={() => this.setState({ titleLabel: !this.props.titleLabel })}
                          onBlur={() => this.setState({ titleLabel: !this.state.titleLabel })}
                          autoCapitalize='words'
                          placeholder="Ex: My Awesome Idea"
                          placeholderTextColor="#999"
                          value={title}
                          onChangeText={title => this.setState({ title })}
                        />

                        <Text style={[styles.labelTitle, { color: this.state.descriptionLabel === false ? '#4b4b4b' : themes[themeKey].accentColor }]}>
                          Description
                  </Text>
                        <TextInput
                          style={styles.input}
                          editable
                          multiline
                          onFocus={() => this.setState({ descriptionLabel: !this.props.descriptionLabel })}
                          onBlur={() => this.setState({ descriptionLabel: !this.state.descriptionLabel })}
                          autoCorrect={false}
                          autoCapitalize="sentences"
                          placeholderTextColor="#999"
                          value={shortDescription}
                          placeholder="Ex: An app that tracks awesome ideas"
                          onChangeText={shortDescription =>
                            this.setState({ shortDescription })
                          }
                        />

                        <Text
                          style={[styles.fieldTitle, { marginTop: 16 }]}>
                          Additional information
                   </Text>

                        <Text style={[styles.labelTitle, { color: this.state.tagsLabel === false ? '#4b4b4b' : themes[themeKey].accentColor }]}>
                          Keywords
                  </Text>

                        <TextInput
                          style={styles.input}
                          autoCorrect={false}
                          autoCapitalize="words"
                          onFocus={() => this.setState({ tagsLabel: !this.props.tagsLabel })}
                          onBlur={() => this.setState({ tagsLabel: !this.state.tagsLabel })}
                          placeholder="Ex: #Random #Pictures #Dogs"
                          placeholderTextColor="#999"
                          value={tags}
                          onChangeText={tags => this.setState({ tags })}
                        />

                        <Text style={[styles.labelTitle, { color: this.state.estimatedTimeLabel === false ? '#4b4b4b' : themes[themeKey].accentColor }]}>
                          Estimated time
                  </Text>

                        <View style={styles.timeContainer}>
                          <View>
                            <TextInput
                              style={styles.input}
                              autoCorrect={false}
                              onFocus={() => this.setState({ estimatedTimeLabel: !this.props.estimatedTimeLabel })}
                              onBlur={() => this.setState({ estimatedTimeLabel: !this.state.estimatedTimeLabel })}
                              autoCapitalize="none"
                              placeholder="0"
                              keyboardType='numeric'
                              placeholderTextColor="#999"
                              value={estimatedTime}
                              onChangeText={estimatedTime => this.setState({ estimatedTime })}
                            />
                          </View>
                          <View style={[styles.selectInput, styles.intervalInput]}>
                            <Picker
                              mode="dropdown"
                              iosIcon={<Icon color={themes[themeKey].accentColor} name="chevron-down" />}
                              style={{ width: '100%', fontFamily: 'Lato-Regular' }}
                              value={estimatedInterval}
                              onChangeText={estimatedInterval => this.setState({ estimatedInterval })}
                              placeholder="Select one option"
                              selectedValue={estimatedInterval}
                              onValueChange={estimatedInterval => this.setState({ estimatedInterval })}
                              placeholderStyle={{ color: "#bfc6ea" }}
                              placeholderIconColor={themes[themeKey].accentColor}>

                              <Picker.Item label="day(s)" value="day(s)" />
                              <Picker.Item label="week(s)" value="week(s)" />
                              <Picker.Item label="month(s)" value="month(s)" />
                              <Picker.Item label="year(s)" value="year(s)" />

                            </Picker>
                          </View>
                        </View>

                        <Text style={[styles.labelTitle, { color: this.state.categoryLabel === false ? '#4b4b4b' : themes[themeKey].accentColor }]}>
                          Category
                  </Text>
                        {
                          defaultCategory ? <View style={styles.selectInput}>
                            <Picker
                              mode="dropdown"
                              iosIcon={<Icon color={themes[themeKey].accentColor} name="chevron-down" />}
                              style={{ width: '100%' }}
                              value={category}
                              onChangeText={category => this.setState({ category })}
                              placeholder="Select one option"
                              onBlur={() => this.setState({ categoryLabel: !this.state.categoryLabel })}
                              selectedValue={category}
                              onValueChange={category => {
                                if (category === 'new') {
                                  this.setState({ defaultCategory: false })
                                } else {
                                  this.setState({ category })
                                }
                              }}
                              placeholderStyle={{ color: "#bfc6ea" }}
                              placeholderIconColor="#007aff"
                            >
                              <Picker.Item label="Application" value="Application" />
                              <Picker.Item label="Website" value="Website" />
                              <Picker.Item label="Software" value="Software" />
                              <Picker.Item label="Bot" value="Bot" />
                              <Picker.Item label="Game" value="Game" />
                              <Picker.Item label="Other" value="Other" />
                              <Picker.Item label="Create new..." value="new" />
                            </Picker>

                          </View> :
                            <View>
                              <TextInput
                                style={styles.input}
                                autoCorrect={false}
                                autoFocus={true}
                                autoCapitalize="words"
                                placeholderTextColor="#999"
                                onChangeText={category => this.setState({ category })}
                              />
                            </View>
                        }

                        <Text style={[styles.labelTitle, { color: this.state.categoryLabel === false ? '#4b4b4b' : themes[themeKey].accentColor }]}>
                          Priority
                  </Text>
                        <View style={styles.selectInput}>
                          <Picker
                            mode="dropdown"
                            iosIcon={<Icon color={themes[themeKey].accentColor} name="chevron-down" />}
                            style={{ width: '100%' }}
                            value={this.state.priority}
                            onChangeText={priority => this.setState({ priority })}
                            placeholder="Select one option"
                            selectedValue={this.state.priority}
                            onValueChange={priority => this.setState({ priority })}
                            placeholderStyle={{ color: "#bfc6ea" }}
                            placeholderIconColor={themes[themeKey].accentColor}
                          >
                            <Picker.Item label="None" value="None" />
                            <Picker.Item label="High" value="High" />
                            <Picker.Item label="Medium" value="Medium" />
                            <Picker.Item label="Low" value="Low" />
                          </Picker>
                        </View>
                      </View>
                    </View>
                  }
                </View>
              </ScrollView>

              <TouchableOpacity
                style={[styles.shareButton, { backgroundColor: themes[themeKey].accentColor }]}
                onPress={() => this.handleSubmit()}>
                <Text style={[styles.shareButtonText]}>{'Update project'}</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    flex: 1,
    minHeight: '100%',
  },
  chevron: {
    height: 60,
    width: '100%',
    marginTop: 16,
  },
  labelTitle: {
    color: '#8c7ae6',
    fontSize: 16,
    fontFamily: 'Lato-Black',
    marginTop: 16
  },
  imgSlider: {
    marginTop: 10,
    flex: 1,
    flexDirection: 'row'
  },
  placeHolder: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    margin: 5,
    width: '98%',
    height: 150
  },
  newPicture: {
    borderColor: '#eee',
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: 100,
    margin: 5,
    borderRadius: 4,
  },
  selectButton: {
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#CCC',
    borderStyle: 'dashed',
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },
  intervalInput: {
    height: 57,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  hitSlop: {
    top: 10,
    bottom: 10,
    left: 10,
    right: 10,
  },
  todoBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  timeContainer: {
    flexDirection: 'row',
    flex: 1, justifyContent: 'center',
    alignItems: 'center'
  },
  overlayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10
  },
  headerTitle: {
    color: 'white',
    fontSize: 32,
    paddingHorizontal: 18,
    marginBottom: 10,
    fontFamily: 'Lato-Black'
  },
  selectInput: {
    borderRadius: 4,
    backgroundColor: "#F7F7F7",
    padding: 5,
    flex: 1,
    marginTop: 10,
  },

  todoContainer: {
    marginRight: 50,
    backgroundColor: '#ECEFF1',
    borderRadius: 4, marginTop: 2,
    marginBottom: 2
  },

  selectButtonText: {
    fontSize: 16,
    color: '#666',
  },
  fieldTitle: {
    color: '#4b4b4b',
    fontSize: 24,
    fontFamily: 'Lato-Black'
  },
  heroImg: {
    width: '100%',
    height: 180,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 16,
  },
  preview: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    margin: 5,
    borderRadius: 4,
  },

  input: {
    borderRadius: 4,
    backgroundColor: "#F7F7F7",
    padding: 15,
    fontFamily: 'Lato-Regular',
    marginTop: 10,
    fontSize: 16,
  },

  shareButton: {
    backgroundColor: '#8c7ae6',
    borderRadius: 4,
    height: 42,
    marginVertical: 10,
    margin: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },

  shareButtonText: {
    fontFamily: 'Lato-Black',
    fontSize: 16,
    color: '#FFF',
  },
});