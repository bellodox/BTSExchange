import React from "react";
import Translate from "react-translate-component";
import Trigger from "react-foundation-apps/src/trigger";
import BaseModal from "../Modal/BaseModal";
import SettingsActions from "actions/SettingsActions";
import counterpart from "counterpart";
import {Modal, Button, Form, Input} from "bitshares-ui-style-guide";

const ws = "ws://";
const wss = "wss://";

class WebsocketAddModal extends React.Component {
    constructor() {
        super();

        let protocol = window.location.protocol;
        this.state = {
            protocol: protocol,
            ws: wss,
            name: "My node",
            type: "remove",
            remove: {},
            addError: null,
            existsError: null
        };
    }

    onServerInput(e) {
        let state = {
            ws: e.target.value
        };

        if (this.apiExists(state.ws)) {
            state.existsError = true;
        } else {
            state.existsError = null;
        }

        if (state.ws.indexOf(wss) !== 0 && state.ws.indexOf(ws) !== 0) {
            state.addError = true;
        } else {
            state.addError = null;
        }

        this.setState(state);
    }

    apiExists(url) {
        return !!this.props.apis.find(api => api.url === url);
    }

    onNameInput(e) {
        this.setState({name: e.target.value});
    }

    show(e, url, name) {
        let state = {};
        if (e.target.id.indexOf("add") !== -1) {
            state.type = "add";
        } else if (e.target.id.indexOf("remove") !== -1) {
            state.type = "remove";
            state.remove = {url, name};
        }

        this.setState(state);
    }

    close() {
        this.setState({
            isModalVisible: false
        });
    }

    onAddSubmit(e) {
        e.preventDefault();

        SettingsActions.addWS({location: this.state.name, url: this.state.ws});

        this.setState({
            ws: this.state.protocol === "https:" ? wss : ws,
            name: ""
        });
        this.props.onClose();
    }

    onRemoveSubmit(e) {
        e.preventDefault();
        let removeIndex;
        this.props.apis.forEach((api, index) => {
            if (api.url === this.state.remove.url) {
                removeIndex = index;
            }
        });

        /* Set default if removing currently active API server */
        if (this.props.api === this.props.apis[removeIndex].url) {
            SettingsActions.changeSetting.defer({
                setting: "apiServer",
                value: this.props.apis[0].url
            });
            this.props.changeConnection(this.props.apis[0].url);
        }

        SettingsActions.removeWS(removeIndex);
        this.close();
    }

    _renderAddModal() {
        let help = "";
        let validateStatus = "";

        if (this.state.existsError) {
            validateStatus = "error";
            help = counterpart.translate("settings.node_already_exists");
        }

        if (this.state.addError) {
            validateStatus = "error";
            help = counterpart.translate("settings.valid_node_url");
        }

        return (
            <Modal
                visible={this.props.isModalVisible}
                id="ws_modal_add"
                ref="ws_modal_add"
                title={counterpart.translate("settings.add_ws")}
                overlay={true}
                overlayClose={false}
                footer={[
                    <Button
                        key="confirm"
                        type="primary"
                        disabled={this.state.addError || this.state.existsError}
                        onClick={this.onAddSubmit.bind(this)}
                    >
                        {counterpart.translate("transfer.confirm")}
                    </Button>,
                    <Button key="cancel" onClick={this.props.onClose}>
                        {counterpart.translate("account.perm.cancel")}
                    </Button>
                ]}
            >
                <div className="grid-content">
                    <Form layout="vertical">
                        <Form.Item label="Name">
                            <Input
                                onChange={this.onNameInput.bind(this)}
                                value={this.state.name}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Address"
                            validateStatus={validateStatus}
                            help={help}
                        >
                            <Input
                                value={this.state.ws}
                                onChange={this.onServerInput.bind(this)}
                            />
                        </Form.Item>
                    </Form>
                </div>
            </Modal>
        );
    }

    render() {
        return <div>{this._renderAddModal()}</div>;
    }
}

export default WebsocketAddModal;
