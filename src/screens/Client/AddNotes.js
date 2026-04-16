import { Alert, Image, ImageBackground, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import Appcolor from '../../constants/Appcolor'
import Appimg from '../../constants/Appimg'
import { SafeAreaView } from 'react-native-safe-area-context'
import Commonstyles from '../../constants/Commonstyles'
import en from '../../translation'
import Tinput from '../../components/Tinput'
import Btn from '../../components/Btn'
import PasswordresetModal from '../../components/PasswordresetModal'
import showToast from '../../CustomToast'
import { CreateClientNoteApi, CreateNoteApi, DeleteClientNotes, GetNotesApi, new_passwordstylist, updateNoteClient } from '../../apimanager/httpServices'
import { useDispatch, useSelector } from 'react-redux'
import { setLoading } from '../../redux/load'
import { useFocusEffect, useTheme } from '@react-navigation/native'
import Header from '../../components/Header'
import moment from 'moment'
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'
import { uploadToS3 } from '../../utils/uploadTos3'
import { launchCamera, launchImageLibrary } from 'react-native-image-picker'
import { RichEditor } from 'react-native-pell-rich-editor'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import CameraModal from '../../components/CameraModal'
import { fileUrl } from '../../apimanager/httpmanager'
import AppUtils from '../../utils/apputils'

export default function AddNotes({ navigation, route }) {
    let dispatch = useDispatch()
    const { Appcolor } = useTheme()
    const styles = useStyles(Appcolor)
    // const { updateData, html } = route?.params
    const { html } = route?.params

    const richText = useRef(null);
    const contentRef = useRef(initHTML);
    const scrollRef = useRef(null);

    const theme = useSelector(state => state.theme)?.theme

    const [updateData, setUpdateData] = useState(null)
    const [title, settitle] = useState('')
    const [desp, setdesp] = useState('')
    const [showPicker, setShowPicker] = useState(false)
    const [editorFocused, setEditorFocused] = useState(false)
    const [editorHeight, setEditorHeight] = useState(500)

    const initHTML = html ? `${html}` : '';

    useEffect(() => {
        if (route?.params?.updateData) {
            setUpdateData(route?.params?.updateData)
        }
    }, [route?.params?.updateData])
    useEffect(() => {
        if (updateData) {
            if (updateData?.description) {
                setdesp(updateData?.description)
            }
            if (updateData?.title) {
                settitle(updateData?.title)
            }
        }
    }, [updateData])

    const handleChange = useCallback((html) => {
        contentRef.current = html;
        setdesp(html)
    }, []);
    const handleCursorPosition = useCallback((scrollY) => {
        // Positioning scroll bar
        scrollRef.current.scrollTo({ y: scrollY - 100, animated: true });
    }, []);
    const handleFocus = useCallback(() => {
        setEditorFocused(true)
    }, []);
    const handleBlur = useCallback(() => {
        setEditorFocused(false)
        Keyboard.dismiss()
    }, []);
    const handleMessage = useCallback(({ type, id, data }) => {
        console.log('onMessage', type, id, data);
        switch (type) {
            case 'ImgClick':
                console.log("asdf");
                // richText.current?.commandDOM(`$('#${id}').src="${imageList[XMath.random(imageList.length - 1)]}"`);
                break;
            // case 'TitleClick':
            //     const color = ['red', 'blue', 'gray', 'yellow', 'coral'];

            //     // command: $ = document.querySelector
            //     richText.current?.commandDOM(`$('#${id}').style.color='${color[XMath.random(color.length - 1)]}'`);
            //     break;
            // case 'SwitchImage':
            //     break;
        }
    }, []);
    const handleInsertHTML = useCallback(() => {
        // `<div style="padding:10px 0;" contentEditable="false">
        //         <img  width="100%" height="220"  src="https://www.youtube.com/embed/6FrNXgXlCGA" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        //     </div>`,
        richText.current?.insertHTML(
            `<div><img src="${imageList[0]}" onclick="_.sendEvent('ImgClick')" contenteditable="false" height="170px"/></div>`
        );
    }, []);
    const handleHeightChange = useCallback((height) => {
        // setEditorHeight(height)
    }, []);

    async function create_notes() {
        if (title.length == 0 || desp.length == 0 || desp?.trim() == "" || title?.trim() == "") {
            showToast('All fields are required')
            return false
        }
        let _data = {
            title: title, description: desp, current_date_time: moment().format()
        }
        try {
            dispatch(setLoading(true))
            let res = await CreateClientNoteApi(_data)
            if (res?.data?.status) {
                setUpdateData(res?.data?.data)
                showToast("Notes created")
                // navigation.pop()
            } else {
                showToast(res?.data?.message ?? "Something went wrong.")
            }
        } catch (e) {
        } finally {
            dispatch(setLoading(false))
        }
    }
    const updateNote = async () => {
        if (title.length == 0 || desp.length == 0) {
            showToast('All fields are required')
            return
        }
        let _data = {
            title: title, description: desp, current_date_time: moment().format(), note_id: updateData?._id
        }
        try {
            dispatch(setLoading(true))
            let res = await updateNoteClient(_data)
            dispatch(setLoading(false))
            if (res?.data?.status) {
                // navigation.pop()
                showToast("Notes updated")
            } else {
                showToast(res?.data?.message ?? "Something went wrong.")
            }
        } catch (e) {
            console.error(e);
        } finally {
            dispatch(setLoading(false))
        }
    }
    async function deleteNote() {
        try {
            dispatch(setLoading(true))
            let res = await DeleteClientNotes(updateData?._id)
            if (res?.data?.status) {
                showToast(res?.data?.message ?? "Deleted successfully")
                navigation?.goBack()
            } else {
            }
        } catch (e) {
        } finally {
            dispatch(setLoading(false))
        }
    }

    const fromCamera = async () => {
        try {
            let perm = await AppUtils.cameraPermisssion()
            if (!perm) {
                Linking.openSettings()
                return
            }
            const result = await launchCamera({ mediaType: "photo" });
            setShowPicker(false)
            if (result?.assets) {
                uploadImg(result?.assets[0])
            }
        } catch (e) {
            console.log(e);
        }
    };
    const fromGallery = async () => {
        try {
            let perm = await AppUtils.galleryPermisssion()
            if (!perm) {
                Linking.openSettings()
                return
            }
            const result = await launchImageLibrary({ mediaType: "photo" });
            setShowPicker(false)
            if (result?.assets) {
                uploadImg(result?.assets[0])
            }
        } catch (e) {
            console.log(e);
        }
    };
    const uploadImg = async (img) => {
        try {
            dispatch(setLoading(true))
            let res = await uploadToS3(img.uri, img.fileName, img.type)
            addToEditor(res?.Key)
        } catch (e) {
            console.error(e);
        }
    }
    const addToEditor = (img) => {
        // richText.current?.insertImage('https://d1ibgiujerad7s.cloudfront.net/gallery/test/1714394699_5.jpeg', 'background: gray;height:200px;');
        // richText.current?.insertImage(`${fileUrl + img}`, 'background: gray;height:300px;', _.sendEvent('ImgClick'));
        richText.current?.insertHTML(
            `<div><img src="${fileUrl + img}" onclick="_.sendEvent('ImgClick')" contenteditable="false" height="400px"/></div>`
        );
        dispatch(setLoading(false))
    }

    return (
        <ImageBackground style={{ flex: 1, backgroundColor: Appcolor.white }} source={theme == 'light' ? Appimg?.bg : Appimg.darkbg1}>
            <Header showBack={true} onBackPress={() => {
                navigation.goBack()
            }} title={(updateData ? "Update" : "Create") + " Notes"}
                done={editorFocused}
                camera={true}
                onPressDone={() => {
                    richText.current?.blurContentEditor();
                    if (updateData) {
                        updateNote()
                        return
                    }
                    create_notes()
                }}
                onPressCamera={() => {
                    setShowPicker(true)
                }}
            />
            <CameraModal
                video={false} visible={showPicker} hideVideoOption={true} onPressCancel={() => setShowPicker(false)}
                onPressCamera={() => { fromCamera() }}
                onPressGallery={() => { fromGallery() }}
            />
            {/* <ScrollView showsVerticalScrollIndicator={false}> */}
            {/* <View style={{ height: heightPercentageToDP(60) }}>
                    <Tinput value={title} onChangeText={(t) => settitle(t)} place={'Subject'} styleMain={{ marginTop: 26 }} />
                    <Tinput value={desp} onChangeText={(t) => setdesp(t)} place={'Note'} styleMain={{ marginTop: 26 }} multiline styleInput={{ height: 150 }} tav={Platform?.OS == "android" && "top"} />
                </View> */}
            <KeyboardAwareScrollView ref={scrollRef}>
                <Tinput value={title} onChangeText={(t) => settitle(t)} place={'Subject'} styleMain={{ marginTop: 26 }} />
                <Text style={[Commonstyles(Appcolor).mediumText10, { color: Appcolor.txt, marginTop: 16, marginLeft: 16 }]}>Note</Text>
                <RichEditor
                    initialFocus={false}
                    firstFocusEnd={true}
                    editorStyle={styles.contentStyle}
                    ref={richText}
                    style={styles.rich}
                    useContainer={true}
                    // initialHeight={editorHeight}
                    enterKeyHint={'return'}
                    placeholder={'Note'}
                    initialContentHTML={initHTML}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onCursorPosition={handleCursorPosition}
                    pasteAsPlainText={true}
                    onMessage={handleMessage}
                    disabled={false}
                    onHeightChange={handleHeightChange}
                />
                {/* <Btn transparent={Appcolor.primary} title={updateData ? "Update" : 'Create'} twhite styleMain={{ alignSelf: "center", marginVertical: 30 }}
                    onPress={() => {
                        if (updateData) {
                            updateNote()
                            return
                        }
                        create_notes()
                    }}
                /> */}
            </KeyboardAwareScrollView>
            {/* {updateData && <Btn transparent={Appcolor.blackop} title={'Delete Note'} twhite styleMain={{ marginTop: 16, alignSelf: "center" }}
                    onPress={() => {
                        Alert.alert(
                            en.areyousure,
                            en.deletenote,
                            [
                                {
                                    text: en.yes,
                                    onPress: () => {
                                        deleteNote()
                                    },
                                },
                                {
                                    text: en.No,
                                },
                            ]
                        );
                    }}
                />} */}
            {/* </ScrollView> */}
        </ImageBackground>
    )
}

const useStyles = (Appcolor) => StyleSheet.create({
    contentStyle: {
        backgroundColor: Appcolor.modal,
        color: '#fff',
        caretColor: Appcolor.txt, // initial valid// initial valid
        placeholderColor: 'gray',
        contentCSSText: 'font-size: 16px; min-height: 200px;', // initial valid
    },
    rich: {
        width: widthPercentageToDP(90),
        alignSelf: "center",
        marginTop: 8,
    }
})