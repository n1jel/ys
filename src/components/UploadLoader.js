import { Modal, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ProgressBar from 'react-native-progress/Bar'
import { useTheme } from '@react-navigation/native'
import Commonstyles from '../constants/Commonstyles'

const UploadLoader = ({ current, total, progress, visible, totalImg ,batchSize}) => {
    //console.log(progress, current, total, "testing here");
    const { Appcolor } = useTheme()

    // const OverAllprogressBarValue = (((parseInt(progress * 100) / 100) * (100 / total)) / 100) + ((current) * ((100 / total)) / 100);
    // console.log(OverAllprogressBarValue, "progresss overall")
    return (

        <Modal transparent={true} visible={visible} style={styles.mainview}>
            <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.7)", alignItems: "center", justifyContent: "center", }}>
                <View style={{ minHeight: 150, width: '90%', backgroundColor: Appcolor.modal, alignItems: 'center' }}>
                    <Text style={[Commonstyles(Appcolor).mediumText18, { marginTop: 20, color: Appcolor.txt }]}>Uploading Media </Text>
                    {/* <Text style={[Commonstyles(Appcolor).mediumText14, { marginVertical: 10, color: Appcolor.txt }]}>{current} out of {total}</Text> */}
                    <Text style={[Commonstyles(Appcolor).mediumText14, { marginVertical: 10, color: Appcolor.txt }]}>{((current + 1) * batchSize) < totalImg ? ((current) * batchSize) : totalImg} out of {totalImg || total}</Text>
                    {progress > 0 && total == 1 ?
                        <Text style={[Commonstyles(Appcolor).mediumText14, { marginVertical: 10, color: Appcolor.txt }]}>{parseInt(progress * 100)}%</Text>
                        :
                        <Text style={[Commonstyles(Appcolor).mediumText14, { marginVertical: 10, color: Appcolor.txt }]}>{parseInt(progress * 100)}%</Text>
                    }

                    {progress > 0 ?
                        <ProgressBar borderWidth={1} color={Appcolor.primary} progress={progress} width={300} />
                        :
                        <ProgressBar borderWidth={1} color={Appcolor.primary} progress={0.01} width={300} />
                    }
                    <View style={{ height: 16, width: "100%" }} />
                    {/* {(progress > 0) &&

                    {/* {progress > 0 && total == 1 ?
                        <Text style={[Commonstyles(Appcolor).mediumText14, { marginVertical: 10, color: Appcolor.txt }]}>{(progressBarValue * 100).toFixed(3)}%</Text>
                        :
                        <Text style={[Commonstyles(Appcolor).mediumText14, { marginVertical: 10, color: Appcolor.txt }]}>{(progressBarValue * 100).toFixed(3)}%</Text>
                    }
                    <ProgressBar borderWidth={1} color={Appcolor.primary} progress={progressBarValue} width={300} /> */}
                    {/* {(progress > 0 && total == 1) ?
                        <ProgressBar borderWidth={1} color={Appcolor.primary} progress={0.5} width={300} />
                        :
                        (current > 0 && total > 0) ?
                            <ProgressBar borderWidth={1} color={Appcolor.primary} progress={(current / total)} width={300} />
                            :
                            <View style={{ width: 300, borderWidth: 1, borderColor: Appcolor.primary, height: 8, borderRadius: 10 }} />
                    } */}
                </View>
            </View>
        </Modal>
    )
}

export default UploadLoader

const styles = StyleSheet.create({
    mainview: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
})