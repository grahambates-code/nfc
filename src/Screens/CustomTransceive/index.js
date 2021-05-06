import React from 'react';
import {
  Alert,
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import {Button, Menu} from 'react-native-paper';
import CustomTransceiveModal from '../../Components/CustomTransceiveModal';
import CommandItem from '../../Components/CustomCommandItem';
import NfcProxy from '../../NfcProxy';
import ScreenHeader from '../../Components/ScreenHeader';
import {NfcTech} from 'react-native-nfc-manager';

function CustomTransceiveScreen(props) {
  const {params} = props.route;
  const nfcTech = params.savedRecord?.payload.tech || params.nfcTech;
  const [showCommandModal, setShowCommandModal] = React.useState(false);

  const row     = [...Array(100)].map((a) => 1);
  const image   = [...Array(150)].map((a, b) => ({"payload": [205, 8, 100, ...row], "type": "command"}))

  const [commands, setCommands] = React.useState(
   [
   {"payload": [205, 13], "type": "command"},
   {"payload": [205, 0, 10], "type": "command"},
   {"payload": 50, "type": "delay"},
   {"payload": [205, 1], "type": "command"},
   {"payload": 10, "type": "delay"},
   {"payload": [205, 2], "type": "command"},
   {"payload": 10, "type": "delay"},
   {"payload": [205, 3], "type": "command"},
   {"payload": 10, "type": "delay"},
   {"payload": [205, 5], "type": "command"},
   {"payload": 10, "type": "delay"},
   {"payload": [205, 6], "type": "command"},
   {"payload": 10, "type": "delay"},
   {"payload": [205, 7], "type": "command"},
    ...image,
  {"payload": [205, 9], "type": "command"},
  {"payload": 200, "type": "delay"},
  {"payload": [205, 10], "type": "command"},
  {"payload": 25, "type": "delay"},
  {"payload": [205, 10], "type": "command"},
  {"payload": 25, "type": "delay"},
  {"payload": [205, 10], "type": "command"},
  {"payload": [205, 4], "type": "command"},

   ]
  );
  const [responses, setResponses] = React.useState([]);

  function addCommand(cmd) {
    setCommands([...commands, cmd]);
    setResponses([]);
  }

  function deleteCommand(idx) {
    const nextCommands = [...commands];
    nextCommands.splice(idx, 1);
    setCommands(nextCommands);
    setResponses([]);
  }

  async function executeCommands() {
    let result = [];

    console.log(commands);

    if (nfcTech === NfcTech.NfcA) {
      result = await NfcProxy.customTransceiveNfcA(commands);
    } else if (nfcTech === NfcTech.IsoDep) {
      result = await NfcProxy.customTransceiveIsoDep(commands);
    }

    const [success, resps] = result;

    if (!success) {
      Alert.alert('Commands Not Finished', '', [
        {text: 'OK', onPress: () => 0},
      ]);
    }

    setResponses(resps);
  }

  function getRecordPayload() {
    return {
      tech: nfcTech,
      value: commands,
    };
  }

  return (
    <>
      <ScreenHeader
        title="CUSTOM TRANSCEIVE"
        navigation={props.navigation}
        getRecordPayload={getRecordPayload}
      />
      <View style={styles.wrapper}>
        <Text style={{padding: 10}}>Tech / {nfcTech}</Text>
        <ScrollView style={[styles.wrapper, {padding: 10}]}>
          {commands.map((cmd, idx) => (
            <CommandItem
              cmd={cmd}
              resp={responses[idx]}
              key={idx}
              onDelete={() => deleteCommand(idx)}
            />
          ))}
        </ScrollView>

        <View style={styles.actionBar}>
          <Button
            mode="contained"
            style={{marginBottom: 8}}
            onPress={() => setShowCommandModal(true)}>
            ADD
          </Button>
          <Button
            mode="outlined"
            disabled={commands.length === 0}
            style={{backgroundColor: 'pink'}}
            onPress={executeCommands}>
            EXECUTE
          </Button>
        </View>
        <SafeAreaView />
      </View>

      <CustomTransceiveModal
        visible={showCommandModal}
        setVisible={setShowCommandModal}
        addCommand={addCommand}
      />
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  actionBar: {
    padding: 10,
  },
});

export default CustomTransceiveScreen;