import { ImageBackground, Keyboard, Linking, StyleSheet, Text } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import Appimg from '../../constants/Appimg'
import Commonstyles from '../../constants/Commonstyles'
import Tinput from '../../components/Tinput'
import showToast from '../../CustomToast'
import { CreateNoteApi, DeleteNotes, updateNoteStylist } from '../../apimanager/httpServices'
import { useDispatch, useSelector } from 'react-redux'
import { setLoading } from '../../redux/load'
import { useTheme } from '@react-navigation/native'
import Header from '../../components/Header'
import moment from 'moment'
import { widthPercentageToDP } from 'react-native-responsive-screen'
import CameraModal from '../../components/CameraModal'
import { launchCamera, launchImageLibrary } from 'react-native-image-picker'
import { RichEditor } from 'react-native-pell-rich-editor'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { uploadToS3 } from '../../utils/uploadTos3'
import { fileUrl } from '../../apimanager/httpmanager'
import AppUtils from '../../utils/apputils'
import { createNote, updateNote } from '../../apimanager/brandServices'

export default function CreateNotesB({ navigation, route }) {
    let dispatch = useDispatch()
    const { Appcolor } = useTheme()
    const styles = useStyles(Appcolor)
    const { html } = route?.params

    const richText = useRef(null);
    const contentRef = useRef(initHTML);
    const scrollRef = useRef(null);

    let theme = useSelector(state => state.theme)?.theme

    const [updateData, setUpdateData] = useState(null)
    const [title, settitle] = useState('')
    const [desp, setdesp] = useState('')
    const [showPicker, setShowPicker] = useState(false)
    const [editorFocused, setEditorFocused] = useState(false)

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
        console.log("aa");
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
        console.log('onMessage', type, id, data);
    }, []);
    const handleInsertHTML = useCallback(() => {
        richText.current?.insertHTML(
            `<div><img src="${imageList[0]}" onclick="_.sendEvent('ImgClick')" contenteditable="false" height="170px"/></div>`
        );
    }, []);
    const handleHeightChange = useCallback((height) => {
        console.log(height);
        // setEditorHeight(height)
    }, []);

    async function create_notes() {
        if (title.length == 0 || desp.length == 0 || desp?.trim() == "" || title?.trim() == "") {
            showToast('All fields are required')
            return false
        }
        try {
            let _data = { title: title, description: desp, current_date_time: moment().format() }
            dispatch(setLoading(true))
            let res = await createNote(_data)
            if (res?.data?.status) {
                setUpdateData(res?.data?.data);
                showToast("Notes created")
            } else {
                showToast(res?.data?.message ?? "Something went wrong.")
            }
        } catch (e) {
            console.error(e);
        } finally {
            dispatch(setLoading(false))
        }
    }
    const update = async () => {
        if (title.length == 0 || desp.length == 0 || desp?.trim() == "" || title?.trim() == "") {
            showToast('All fields are required')
            return false
        }
        let _data = {
            title: title, description: desp, current_date_time: moment().format(), note_id: updateData?._id
        }
        try {
            dispatch(setLoading(true))
            let res = await updateNote(_data)
            if (res?.data?.status) {
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
    const deleteNote = async () => {
        try {
            dispatch(setLoading(true))
            let res = await DeleteNotes(updateData?._id)
            if (res?.data?.status) {
                showToast(res?.data?.message ?? "Deleted successfully")
                navigation?.goBack()
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
        richText.current?.insertHTML(
            `<div><img src="${fileUrl + img}" onclick="_.sendEvent('ImgClick')" contenteditable="false" height="400px"/></div>`
        );
        dispatch(setLoading(false))
    }

    return (
        <ImageBackground style={{ flex: 1, backgroundColor: Appcolor.white }} source={theme == 'light' ? Appimg?.bg : Appimg.darkbg1}>
            <Header
                showBack={true}
                onBackPress={() => {
                    navigation.goBack()
                }}
                title={(updateData ? "Update" : "Create") + " Notes"}
                camera={true}
                onPressDone={() => {
                    richText.current?.blurContentEditor();
                    if (updateData) {
                        update()
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
            </KeyboardAwareScrollView>
        </ImageBackground>
    )
}

const useStyles = (Appcolor) => StyleSheet.create({
    contentStyle: {
        backgroundColor: Appcolor.modal,
        color: '#fff',
        caretColor: Appcolor.txt,
        placeholderColor: 'gray',
        contentCSSText: 'font-size: 16px; min-height: 200px;',
    },
    rich: {
        width: widthPercentageToDP(90),
        alignSelf: "center",
        marginTop: 8,
    }
})