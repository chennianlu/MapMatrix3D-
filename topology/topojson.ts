export const json = {
    "nodeId": null,
    "topologyId": "gMA4bNKY",
    "topologyName": "低碳综合能源站",
    "topology": {
        "nodes": [
            {
                "id": "355d2b9a-c529-4cc6-be71-71bf439b3887",
                "name": null,
                "assetId": "WiVFN3d1",
                "type": null,
                "data": {
                    "dataAttr": [],
                    "deviceList": [
                        {
                            "templateId": "ChgUnitTempLate",
                            "templateName": "新能安&V2G&下党&回归-下党_充电单元",
                            "modelId": null,
                            "sourceModelId": "ChgU",
                            "rootTemplateId": null,
                            "deviceTag": null,
                            "inlineId": "zG0Lr0xy",
                            "modelLabel": "CHARGING",
                            "modelType": "",
                            "deviceId": "WiVFN3d1",
                            "deviceName": "车棚充电",
                            "deviceType": null,
                            "topology": {
                                "nodes": null,
                                "edges": null,
                                "graph": null,
                                "cells": null,
                                "topologyIndex": null
                            },
                            "nodeVisible": null,
                            "manufacturer": "系统内置",
                            "deviceCode": "下党低碳临港-下党_充电单元"
                        }
                    ],
                    "extra": {
                        "type": "BusinessMeasurement",
                        "label": "车棚充电",
                        "imgUrl": "/api/encompass/model/file/download/603df9e3f59d41a8bc972546b8b1c4d9.svg",
                        "serial": 1,
                        "actions": [],
                        "assetId": "WiVFN3d1",
                        "inlineId": "5d441cef-0b73-4bae-8b45-d4d2c41df269",
                        "hideLabel": false,
                        "modelType": "ChgU",
                        "identifyType": "ChgUnitTempLate",
                        "modelCategory": "unit"
                    }
                },
                "position": {
                    "x": 450,
                    "y": 90
                },
                "size": {
                    "width": 80,
                    "height": 80
                },
                "attrs": {
                    "text": {
                        "text": "新能安&V2G&下党\n&回归-下党_充电单\n元1"
                    },
                    "image": {
                        "xlink:href": "/api/encompass/model/file/download/603df9e3f59d41a8bc972546b8b1c4d9.svg?token=eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX3NldHRpbmdzIjp7InRoZW1lIjoiZGVmYXVsdCIsImxhbmciOiJ6aC1DTiJ9LCJ0ZW5hbnRfbmFtZSI6bnVsbCwidXNlcl9pZCI6MzQxMTk5LCJ1c2VyX2tleSI6Ijc5MTVmMjYwLTViOTAtNDA5OS1iYTYxLTFkYTIzMzc1Nzg5MyIsImRlcHRfaWQiOjIwMTksInJvbGVTZXQiOlsiYnl0MWpvcHFfYWRtaW4iXSwidGVuYW50LWlkIjoiYnl0MWpvcHEiLCJlbWFpbCI6IiIsImN1c3RvbWVyX3NldCI6bnVsbCwidXNlcm5hbWUiOiJieXQxam9wcV9hZG1pbiIsInRlbmFudF9jb2RlIjpudWxsfQ.-qagdcqeDArzG3AOyUvDI_IjE9G7aksg0huyu9zL2Mo",
                        "preserveAspectRatio": "none"
                    },
                    "label": {
                        "refX": 0.5,
                        "refY": "100%",
                        "text": "车棚充电",
                        "refY2": 4,
                        "display": "",
                        "textAnchor": "middle",
                        "textVerticalAnchor": "top"
                    }
                },
                "visible": true,
                "shape": "shape::custom::image",
                "children": null,
                "tools": {
                    "items": []
                },
                "ports": {
                    "items": [
                        {
                            "id": "ecf0dbb9-d35f-4a16-9aaf-4c1715e95189",
                            "args": {
                                "x": 0.49291919526599703,
                                "y": 0.08245297386532738
                            },
                            "name": "连接",
                            "group": "unlimited"
                        }
                    ],
                    "groups": {
                        "ac": {
                            "attrs": {
                                "fo": {
                                    "x": -4,
                                    "y": -4,
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "width": 8,
                                    "height": 8,
                                    "magnet": "true"
                                },
                                "circle": {
                                    "r": 2,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        },
                        "dc": {
                            "attrs": {
                                "fo": {
                                    "x": -4,
                                    "y": -4,
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "width": 8,
                                    "height": 8,
                                    "magnet": "true"
                                },
                                "circle": {
                                    "r": 2,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        },
                        "modbus": {
                            "attrs": {
                                "fo": {
                                    "x": -4,
                                    "y": -4,
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "width": 8,
                                    "height": 8,
                                    "magnet": "true"
                                },
                                "circle": {
                                    "r": 2,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        },
                        "dynamic": {
                            "attrs": {
                                "circle": {
                                    "r": 0,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        },
                        "unlimited": {
                            "attrs": {
                                "fo": {
                                    "x": -4,
                                    "y": -4,
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "width": 8,
                                    "height": 8,
                                    "magnet": "true"
                                },
                                "circle": {
                                    "r": 2,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        }
                    }
                },
                "portMarkup": [
                    {
                        "tagName": "foreignObject",
                        "children": [
                            {
                                "ns": "http://www.w3.org/1999/xhtml",
                                "attrs": {
                                    "xmlns": "http://www.w3.org/1999/xhtml"
                                },
                                "style": {
                                    "width": "100%",
                                    "height": "100%",
                                    "background": "transparent"
                                },
                                "tagName": "body",
                                "children": [
                                    {
                                        "style": {
                                            "width": "100%",
                                            "height": "100%"
                                        },
                                        "tagName": "div",
                                        "selector": "foContent"
                                    }
                                ],
                                "selector": "foBody"
                            }
                        ],
                        "selector": "fo"
                    }
                ],
                "angle": null,
                "zIndex": 1
            },
            {
                "id": "029cf8d0-1a5f-4d65-a38f-18c3f8b7423f",
                "name": null,
                "assetId": "OaGyiz7w",
                "type": null,
                "data": {
                    "dataAttr": [],
                    "deviceList": [
                        {
                            "templateId": "ChgUnitTempLate",
                            "templateName": "新能安&V2G&下党&回归-下党_充电单元",
                            "modelId": null,
                            "sourceModelId": "ChgU",
                            "rootTemplateId": null,
                            "deviceTag": null,
                            "inlineId": "Embhy2fA",
                            "modelLabel": "CHARGING",
                            "modelType": "",
                            "deviceId": "OaGyiz7w",
                            "deviceName": "停车场充电",
                            "deviceType": null,
                            "topology": {
                                "nodes": null,
                                "edges": null,
                                "graph": null,
                                "cells": null,
                                "topologyIndex": null
                            },
                            "nodeVisible": null,
                            "manufacturer": "系统内置",
                            "deviceCode": "下党低碳临港-下党_充电单元"
                        }
                    ],
                    "extra": {
                        "type": "BusinessMeasurement",
                        "label": "停车场充电",
                        "imgUrl": "/api/encompass/model/file/download/603df9e3f59d41a8bc972546b8b1c4d9.svg",
                        "serial": 2,
                        "actions": [],
                        "assetId": "OaGyiz7w",
                        "inlineId": "a9d13373-e773-4754-8294-0e5225609dd7",
                        "hideLabel": false,
                        "modelType": "ChgU",
                        "identifyType": "ChgUnitTempLate",
                        "modelCategory": "unit"
                    }
                },
                "position": {
                    "x": 1175,
                    "y": 90
                },
                "size": {
                    "width": 80,
                    "height": 80
                },
                "attrs": {
                    "text": {
                        "text": "新能安&V2G&下党\n&回归-下党_充电单\n元2"
                    },
                    "image": {
                        "xlink:href": "/api/encompass/model/file/download/603df9e3f59d41a8bc972546b8b1c4d9.svg?token=eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX3NldHRpbmdzIjp7InRoZW1lIjoiZGVmYXVsdCIsImxhbmciOiJ6aC1DTiJ9LCJ0ZW5hbnRfbmFtZSI6bnVsbCwidXNlcl9pZCI6MzQxMTk5LCJ1c2VyX2tleSI6Ijc5MTVmMjYwLTViOTAtNDA5OS1iYTYxLTFkYTIzMzc1Nzg5MyIsImRlcHRfaWQiOjIwMTksInJvbGVTZXQiOlsiYnl0MWpvcHFfYWRtaW4iXSwidGVuYW50LWlkIjoiYnl0MWpvcHEiLCJlbWFpbCI6IiIsImN1c3RvbWVyX3NldCI6bnVsbCwidXNlcm5hbWUiOiJieXQxam9wcV9hZG1pbiIsInRlbmFudF9jb2RlIjpudWxsfQ.-qagdcqeDArzG3AOyUvDI_IjE9G7aksg0huyu9zL2Mo",
                        "preserveAspectRatio": "none"
                    },
                    "label": {
                        "refX": 0.5,
                        "refY": "100%",
                        "text": "停车场充电",
                        "refY2": 4,
                        "display": "",
                        "textAnchor": "middle",
                        "textVerticalAnchor": "top"
                    }
                },
                "visible": true,
                "shape": "shape::custom::image",
                "children": null,
                "tools": {
                    "items": []
                },
                "ports": {
                    "items": [
                        {
                            "id": "ecf0dbb9-d35f-4a16-9aaf-4c1715e95189",
                            "args": {
                                "x": 0.49291919526599703,
                                "y": 0.08245297386532738
                            },
                            "name": "连接",
                            "group": "unlimited"
                        }
                    ],
                    "groups": {
                        "ac": {
                            "attrs": {
                                "fo": {
                                    "x": -4,
                                    "y": -4,
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "width": 8,
                                    "height": 8,
                                    "magnet": "true"
                                },
                                "circle": {
                                    "r": 2,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        },
                        "dc": {
                            "attrs": {
                                "fo": {
                                    "x": -4,
                                    "y": -4,
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "width": 8,
                                    "height": 8,
                                    "magnet": "true"
                                },
                                "circle": {
                                    "r": 2,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        },
                        "modbus": {
                            "attrs": {
                                "fo": {
                                    "x": -4,
                                    "y": -4,
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "width": 8,
                                    "height": 8,
                                    "magnet": "true"
                                },
                                "circle": {
                                    "r": 2,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        },
                        "dynamic": {
                            "attrs": {
                                "circle": {
                                    "r": 0,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        },
                        "unlimited": {
                            "attrs": {
                                "fo": {
                                    "x": -4,
                                    "y": -4,
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "width": 8,
                                    "height": 8,
                                    "magnet": "true"
                                },
                                "circle": {
                                    "r": 2,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        }
                    }
                },
                "portMarkup": [
                    {
                        "tagName": "foreignObject",
                        "children": [
                            {
                                "ns": "http://www.w3.org/1999/xhtml",
                                "attrs": {
                                    "xmlns": "http://www.w3.org/1999/xhtml"
                                },
                                "style": {
                                    "width": "100%",
                                    "height": "100%",
                                    "background": "transparent"
                                },
                                "tagName": "body",
                                "children": [
                                    {
                                        "style": {
                                            "width": "100%",
                                            "height": "100%"
                                        },
                                        "tagName": "div",
                                        "selector": "foContent"
                                    }
                                ],
                                "selector": "foBody"
                            }
                        ],
                        "selector": "fo"
                    }
                ],
                "angle": null,
                "zIndex": 2
            },
            {
                "id": "b476c93a-c6bd-47c1-befe-8147ec7ea6fa",
                "name": null,
                "assetId": "L3oyPpq1",
                "type": null,
                "data": {
                    "dataAttr": [],
                    "deviceList": [
                        {
                            "templateId": "ESUTempL",
                            "templateName": "新能安&V2G&下党&回归-下党_储能单元",
                            "modelId": null,
                            "sourceModelId": "ESU",
                            "rootTemplateId": null,
                            "deviceTag": null,
                            "inlineId": "Embhy2fA",
                            "modelLabel": "ENERGY_STORAGE",
                            "modelType": "",
                            "deviceId": "L3oyPpq1",
                            "deviceName": "#2储能系统",
                            "deviceType": null,
                            "topology": {
                                "nodes": null,
                                "edges": null,
                                "graph": null,
                                "cells": null,
                                "topologyIndex": null
                            },
                            "nodeVisible": null,
                            "manufacturer": "系统内置",
                            "deviceCode": "下党低碳临港-下党_储能单元"
                        }
                    ],
                    "extra": {
                        "type": "BusinessMeasurement",
                        "label": "#2储能系统",
                        "imgUrl": "/api/encompass/model/file/download/a40448bab1574447be00336fd069a3ee.svg",
                        "serial": 2,
                        "actions": [],
                        "inlineId": "a9d13373-e773-4754-8294-0e5225609dd7",
                        "hideLabel": false,
                        "modelType": "ESU",
                        "identifyType": "ESUTempL",
                        "modelCategory": "unit"
                    }
                },
                "position": {
                    "x": 830,
                    "y": 90
                },
                "size": {
                    "width": 80,
                    "height": 80
                },
                "attrs": {
                    "text": {
                        "text": "新能安&V2G&下党\n&回归-下党_储能单\n元2"
                    },
                    "image": {
                        "xlink:href": "/api/encompass/model/file/download/a40448bab1574447be00336fd069a3ee.svg?token=eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX3NldHRpbmdzIjp7InRoZW1lIjoiZGVmYXVsdCIsImxhbmciOiJ6aC1DTiJ9LCJ0ZW5hbnRfbmFtZSI6bnVsbCwidXNlcl9pZCI6MzQxMTk5LCJ1c2VyX2tleSI6Ijc5MTVmMjYwLTViOTAtNDA5OS1iYTYxLTFkYTIzMzc1Nzg5MyIsImRlcHRfaWQiOjIwMTksInJvbGVTZXQiOlsiYnl0MWpvcHFfYWRtaW4iXSwidGVuYW50LWlkIjoiYnl0MWpvcHEiLCJlbWFpbCI6IiIsImN1c3RvbWVyX3NldCI6bnVsbCwidXNlcm5hbWUiOiJieXQxam9wcV9hZG1pbiIsInRlbmFudF9jb2RlIjpudWxsfQ.-qagdcqeDArzG3AOyUvDI_IjE9G7aksg0huyu9zL2Mo",
                        "preserveAspectRatio": "none"
                    },
                    "label": {
                        "refX": 0.5,
                        "refY": "100%",
                        "text": "#2储能系统",
                        "refY2": 4,
                        "display": "",
                        "textAnchor": "middle",
                        "textVerticalAnchor": "top"
                    }
                },
                "visible": true,
                "shape": "shape::custom::image",
                "children": null,
                "tools": {
                    "items": []
                },
                "ports": {
                    "items": [
                        {
                            "id": "ce48c4a4-a9ae-42c4-bedc-6b8052ba535b",
                            "args": {
                                "x": 0.5405382428850446,
                                "y": 0.06340535481770833
                            },
                            "name": "连接",
                            "group": "unlimited"
                        }
                    ],
                    "groups": {
                        "ac": {
                            "attrs": {
                                "fo": {
                                    "x": -4,
                                    "y": -4,
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "width": 8,
                                    "height": 8,
                                    "magnet": "true"
                                },
                                "circle": {
                                    "r": 2,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        },
                        "dc": {
                            "attrs": {
                                "fo": {
                                    "x": -4,
                                    "y": -4,
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "width": 8,
                                    "height": 8,
                                    "magnet": "true"
                                },
                                "circle": {
                                    "r": 2,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        },
                        "modbus": {
                            "attrs": {
                                "fo": {
                                    "x": -4,
                                    "y": -4,
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "width": 8,
                                    "height": 8,
                                    "magnet": "true"
                                },
                                "circle": {
                                    "r": 2,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        },
                        "dynamic": {
                            "attrs": {
                                "circle": {
                                    "r": 0,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        },
                        "unlimited": {
                            "attrs": {
                                "fo": {
                                    "x": -4,
                                    "y": -4,
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "width": 8,
                                    "height": 8,
                                    "magnet": "true"
                                },
                                "circle": {
                                    "r": 2,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        }
                    }
                },
                "portMarkup": [
                    {
                        "tagName": "foreignObject",
                        "children": [
                            {
                                "ns": "http://www.w3.org/1999/xhtml",
                                "attrs": {
                                    "xmlns": "http://www.w3.org/1999/xhtml"
                                },
                                "style": {
                                    "width": "100%",
                                    "height": "100%",
                                    "background": "transparent"
                                },
                                "tagName": "body",
                                "children": [
                                    {
                                        "style": {
                                            "width": "100%",
                                            "height": "100%"
                                        },
                                        "tagName": "div",
                                        "selector": "foContent"
                                    }
                                ],
                                "selector": "foBody"
                            }
                        ],
                        "selector": "fo"
                    }
                ],
                "angle": null,
                "zIndex": 4
            },
            {
                "id": "5d441cef-0b73-4bae-8b45-d4d2c41df269",
                "name": null,
                "assetId": "zG0Lr0xy",
                "type": null,
                "data": {
                    "dataAttr": [],
                    "deviceList": [
                        {
                            "templateId": "IncomingLineSwitch",
                            "templateName": "新能安&V2G&下党&回归-进线开关",
                            "modelId": null,
                            "sourceModelId": "LI",
                            "rootTemplateId": null,
                            "deviceTag": null,
                            "inlineId": null,
                            "modelLabel": "POWER_DISTRIBUTION",
                            "modelType": "",
                            "deviceId": "zG0Lr0xy",
                            "deviceName": "1#10kV进线",
                            "deviceType": null,
                            "topology": {
                                "nodes": null,
                                "edges": null,
                                "graph": null,
                                "cells": null,
                                "topologyIndex": null
                            },
                            "nodeVisible": null,
                            "manufacturer": "系统内置",
                            "deviceCode": "新能安&V2G&下党&回归-进线开关"
                        }
                    ],
                    "extra": {
                        "type": "BusinessMeasurement",
                        "label": "1#10kV进线",
                        "imgUrl": "/api/encompass/model/file/download/线路保护设备_20241205160313.svg",
                        "serial": 1,
                        "actions": [
                            {
                                "key": "action-1740737168681",
                                "label": "行为1",
                                "nodeAttr": [
                                    {
                                        "id": 23697,
                                        "tag": null,
                                        "name": "总有功功率",
                                        "unit": null,
                                        "modelId": "LI",
                                        "tagList": null,
                                        "dataType": {
                                            "type": "float",
                                            "specs": {
                                                "unit": "kW",
                                                "unitName": "千瓦"
                                            }
                                        },
                                        "required": false,
                                        "tenantId": null,
                                        "typeCode": "float",
                                        "unitCode": "kW",
                                        "unitName": "千瓦",
                                        "dataValue": null,
                                        "identifier": "P",
                                        "modelLabel": null,
                                        "typeCnName": "单精度浮点型",
                                        "typeEnName": null,
                                        "description": null,
                                        "modelSource": 0,
                                        "pointMapping": null,
                                        "propertyType": 1,
                                        "measurementType": 1,
                                        "relatedIdentifier": null,
                                        "relatedIdentifierName": null,
                                        "relatedMeasurementType": null
                                    },
                                    {
                                        "id": 23701,
                                        "tag": null,
                                        "name": "总无功功率",
                                        "unit": null,
                                        "modelId": "LI",
                                        "tagList": null,
                                        "dataType": {
                                            "type": "float",
                                            "specs": {
                                                "unit": "kVar",
                                                "unitName": "无功千伏安"
                                            }
                                        },
                                        "required": false,
                                        "tenantId": null,
                                        "typeCode": "float",
                                        "unitCode": "kVar",
                                        "unitName": "无功千伏安",
                                        "dataValue": null,
                                        "identifier": "Q",
                                        "modelLabel": null,
                                        "typeCnName": "单精度浮点型",
                                        "typeEnName": null,
                                        "description": null,
                                        "modelSource": 0,
                                        "pointMapping": null,
                                        "propertyType": 1,
                                        "measurementType": 1,
                                        "relatedIdentifier": null,
                                        "relatedIdentifierName": null,
                                        "relatedMeasurementType": null
                                    },
                                    {
                                        "id": 23705,
                                        "tag": null,
                                        "name": "总视在功率",
                                        "unit": null,
                                        "modelId": "LI",
                                        "tagList": null,
                                        "dataType": {
                                            "type": "float",
                                            "specs": {
                                                "unit": "kVA",
                                                "unitName": "千伏安"
                                            }
                                        },
                                        "required": false,
                                        "tenantId": null,
                                        "typeCode": "float",
                                        "unitCode": "kVA",
                                        "unitName": "千伏安",
                                        "dataValue": null,
                                        "identifier": "S",
                                        "modelLabel": null,
                                        "typeCnName": "单精度浮点型",
                                        "typeEnName": null,
                                        "description": null,
                                        "modelSource": 0,
                                        "pointMapping": null,
                                        "propertyType": 1,
                                        "measurementType": 1,
                                        "relatedIdentifier": null,
                                        "relatedIdentifierName": null,
                                        "relatedMeasurementType": null
                                    }
                                ],
                                "actionType": "MeasurementPanel"
                            }
                        ],
                        "assetId": "zG0Lr0xy",
                        "inlineId": null,
                        "validate": "ac",
                        "hideLabel": false,
                        "modelType": "LI",
                        "identifyType": "IncomingLineSwitch",
                        "modelCategory": "device"
                    }
                },
                "position": {
                    "x": 370,
                    "y": -255
                },
                "size": {
                    "width": 80,
                    "height": 80
                },
                "attrs": {
                    "text": {
                        "text": "新能安&V2G&下党\n&回归-进线开关1"
                    },
                    "image": {
                        "xlink:href": "/api/encompass/model/file/download/线路保护设备_20241205160313.svg?token=eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX3NldHRpbmdzIjp7InRoZW1lIjoiZGVmYXVsdCIsImxhbmciOiJ6aC1DTiJ9LCJ0ZW5hbnRfbmFtZSI6bnVsbCwidXNlcl9pZCI6MzQxMTk5LCJ1c2VyX2tleSI6Ijc5MTVmMjYwLTViOTAtNDA5OS1iYTYxLTFkYTIzMzc1Nzg5MyIsImRlcHRfaWQiOjIwMTksInJvbGVTZXQiOlsiYnl0MWpvcHFfYWRtaW4iXSwidGVuYW50LWlkIjoiYnl0MWpvcHEiLCJlbWFpbCI6IiIsImN1c3RvbWVyX3NldCI6bnVsbCwidXNlcm5hbWUiOiJieXQxam9wcV9hZG1pbiIsInRlbmFudF9jb2RlIjpudWxsfQ.-qagdcqeDArzG3AOyUvDI_IjE9G7aksg0huyu9zL2Mo",
                        "preserveAspectRatio": "none"
                    },
                    "label": {
                        "refX": 0.5,
                        "refY": "100%",
                        "text": "1#10kV进线",
                        "refY2": 4,
                        "display": "",
                        "textAnchor": "middle",
                        "textVerticalAnchor": "top"
                    }
                },
                "visible": true,
                "shape": "shape::custom::image_in_line",
                "children": [
                    "5d441cef-0b73-4bae-8b45-d4d2c41df269-panel"
                ],
                "tools": {
                    "items": []
                },
                "ports": {
                    "items": [
                        {
                            "id": "8a2d44b7-1972-481a-a5bc-c40a4585d566",
                            "args": {
                                "x": 0.4976190476190476,
                                "y": 0.1921875
                            },
                            "name": "AC",
                            "group": "ac"
                        },
                        {
                            "id": "c05c25d2-cafb-40b6-8bc7-e3c5bb6d80e2",
                            "args": {
                                "x": 0.4928571428571429,
                                "y": 0.811235119047619
                            },
                            "name": "AC1",
                            "group": "ac"
                        }
                    ],
                    "groups": {
                        "ac": {
                            "attrs": {
                                "fo": {
                                    "x": -4,
                                    "y": -4,
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "width": 8,
                                    "height": 8,
                                    "magnet": "true"
                                },
                                "circle": {
                                    "r": 2,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        },
                        "dc": {
                            "attrs": {
                                "fo": {
                                    "x": -4,
                                    "y": -4,
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "width": 8,
                                    "height": 8,
                                    "magnet": "true"
                                },
                                "circle": {
                                    "r": 2,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        },
                        "modbus": {
                            "attrs": {
                                "fo": {
                                    "x": -4,
                                    "y": -4,
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "width": 8,
                                    "height": 8,
                                    "magnet": "true"
                                },
                                "circle": {
                                    "r": 2,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        },
                        "dynamic": {
                            "attrs": {
                                "circle": {
                                    "r": 0,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        },
                        "unlimited": {
                            "attrs": {
                                "fo": {
                                    "x": -4,
                                    "y": -4,
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "width": 8,
                                    "height": 8,
                                    "magnet": "true"
                                },
                                "circle": {
                                    "r": 2,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        }
                    }
                },
                "portMarkup": [
                    {
                        "tagName": "foreignObject",
                        "children": [
                            {
                                "ns": "http://www.w3.org/1999/xhtml",
                                "attrs": {
                                    "xmlns": "http://www.w3.org/1999/xhtml"
                                },
                                "style": {
                                    "width": "100%",
                                    "height": "100%",
                                    "background": "transparent"
                                },
                                "tagName": "body",
                                "children": [
                                    {
                                        "style": {
                                            "width": "100%",
                                            "height": "100%"
                                        },
                                        "tagName": "div",
                                        "selector": "foContent"
                                    }
                                ],
                                "selector": "foBody"
                            }
                        ],
                        "selector": "fo"
                    }
                ],
                "angle": null,
                "zIndex": 5
            },
            {
                "id": "a9d13373-e773-4754-8294-0e5225609dd7",
                "name": null,
                "assetId": "Embhy2fA",
                "type": null,
                "data": {
                    "dataAttr": [],
                    "deviceList": [
                        {
                            "templateId": "IncomingLineSwitch",
                            "templateName": "新能安&V2G&下党&回归-进线开关",
                            "modelId": null,
                            "sourceModelId": "LI",
                            "rootTemplateId": null,
                            "deviceTag": null,
                            "inlineId": null,
                            "modelLabel": "POWER_DISTRIBUTION",
                            "modelType": "",
                            "deviceId": "Embhy2fA",
                            "deviceName": "2#10kV进线",
                            "deviceType": null,
                            "topology": {
                                "nodes": null,
                                "edges": null,
                                "graph": null,
                                "cells": null,
                                "topologyIndex": null
                            },
                            "nodeVisible": null,
                            "manufacturer": "系统内置",
                            "deviceCode": "新能安&V2G&下党&回归-进线开关"
                        }
                    ],
                    "extra": {
                        "type": "BusinessMeasurement",
                        "label": "2#10kV进线",
                        "imgUrl": "/api/encompass/model/file/download/线路保护设备_20241205160313.svg",
                        "serial": 2,
                        "actions": [
                            {
                                "key": "action-1740737220209",
                                "label": "行为1",
                                "nodeAttr": [
                                    {
                                        "id": 23697,
                                        "tag": null,
                                        "name": "总有功功率",
                                        "unit": null,
                                        "modelId": "LI",
                                        "tagList": null,
                                        "dataType": {
                                            "type": "float",
                                            "specs": {
                                                "unit": "kW",
                                                "unitName": "千瓦"
                                            }
                                        },
                                        "required": false,
                                        "tenantId": null,
                                        "typeCode": "float",
                                        "unitCode": "kW",
                                        "unitName": "千瓦",
                                        "dataValue": null,
                                        "identifier": "P",
                                        "modelLabel": null,
                                        "typeCnName": "单精度浮点型",
                                        "typeEnName": null,
                                        "description": null,
                                        "modelSource": 0,
                                        "pointMapping": null,
                                        "propertyType": 1,
                                        "measurementType": 1,
                                        "relatedIdentifier": null,
                                        "relatedIdentifierName": null,
                                        "relatedMeasurementType": null
                                    },
                                    {
                                        "id": 23704,
                                        "tag": null,
                                        "name": "C相无功功率",
                                        "unit": null,
                                        "modelId": "LI",
                                        "tagList": null,
                                        "dataType": {
                                            "type": "float",
                                            "specs": {
                                                "unit": "kVar",
                                                "unitName": "无功千伏安"
                                            }
                                        },
                                        "required": false,
                                        "tenantId": null,
                                        "typeCode": "float",
                                        "unitCode": "kVar",
                                        "unitName": "无功千伏安",
                                        "dataValue": null,
                                        "identifier": "Qc",
                                        "modelLabel": null,
                                        "typeCnName": "单精度浮点型",
                                        "typeEnName": null,
                                        "description": null,
                                        "modelSource": 0,
                                        "pointMapping": null,
                                        "propertyType": 1,
                                        "measurementType": 1,
                                        "relatedIdentifier": null,
                                        "relatedIdentifierName": null,
                                        "relatedMeasurementType": null
                                    },
                                    {
                                        "id": 23705,
                                        "tag": null,
                                        "name": "总视在功率",
                                        "unit": null,
                                        "modelId": "LI",
                                        "tagList": null,
                                        "dataType": {
                                            "type": "float",
                                            "specs": {
                                                "unit": "kVA",
                                                "unitName": "千伏安"
                                            }
                                        },
                                        "required": false,
                                        "tenantId": null,
                                        "typeCode": "float",
                                        "unitCode": "kVA",
                                        "unitName": "千伏安",
                                        "dataValue": null,
                                        "identifier": "S",
                                        "modelLabel": null,
                                        "typeCnName": "单精度浮点型",
                                        "typeEnName": null,
                                        "description": null,
                                        "modelSource": 0,
                                        "pointMapping": null,
                                        "propertyType": 1,
                                        "measurementType": 1,
                                        "relatedIdentifier": null,
                                        "relatedIdentifierName": null,
                                        "relatedMeasurementType": null
                                    }
                                ],
                                "actionType": "MeasurementPanel"
                            }
                        ],
                        "assetId": "Embhy2fA",
                        "inlineId": null,
                        "validate": "ac",
                        "hideLabel": false,
                        "modelType": "LI",
                        "identifyType": "IncomingLineSwitch",
                        "modelCategory": "device"
                    }
                },
                "position": {
                    "x": 1057.5,
                    "y": -255
                },
                "size": {
                    "width": 80,
                    "height": 80
                },
                "attrs": {
                    "text": {
                        "text": "新能安&V2G&下党\n&回归-进线开关2"
                    },
                    "image": {
                        "xlink:href": "/api/encompass/model/file/download/线路保护设备_20241205160313.svg?token=eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX3NldHRpbmdzIjp7InRoZW1lIjoiZGVmYXVsdCIsImxhbmciOiJ6aC1DTiJ9LCJ0ZW5hbnRfbmFtZSI6bnVsbCwidXNlcl9pZCI6MzQxMTk5LCJ1c2VyX2tleSI6Ijc5MTVmMjYwLTViOTAtNDA5OS1iYTYxLTFkYTIzMzc1Nzg5MyIsImRlcHRfaWQiOjIwMTksInJvbGVTZXQiOlsiYnl0MWpvcHFfYWRtaW4iXSwidGVuYW50LWlkIjoiYnl0MWpvcHEiLCJlbWFpbCI6IiIsImN1c3RvbWVyX3NldCI6bnVsbCwidXNlcm5hbWUiOiJieXQxam9wcV9hZG1pbiIsInRlbmFudF9jb2RlIjpudWxsfQ.-qagdcqeDArzG3AOyUvDI_IjE9G7aksg0huyu9zL2Mo",
                        "preserveAspectRatio": "none"
                    },
                    "label": {
                        "refX": 0.5,
                        "refY": "100%",
                        "text": "2#10kV进线",
                        "refY2": 4,
                        "display": "",
                        "textAnchor": "middle",
                        "textVerticalAnchor": "top"
                    }
                },
                "visible": true,
                "shape": "shape::custom::image_in_line",
                "children": [
                    "a9d13373-e773-4754-8294-0e5225609dd7-panel"
                ],
                "tools": {
                    "items": []
                },
                "ports": {
                    "items": [
                        {
                            "id": "8a2d44b7-1972-481a-a5bc-c40a4585d566",
                            "args": {
                                "x": 0.4976190476190476,
                                "y": 0.1921875
                            },
                            "name": "AC",
                            "group": "ac"
                        },
                        {
                            "id": "c05c25d2-cafb-40b6-8bc7-e3c5bb6d80e2",
                            "args": {
                                "x": 0.4928571428571429,
                                "y": 0.811235119047619
                            },
                            "name": "AC1",
                            "group": "ac"
                        }
                    ],
                    "groups": {
                        "ac": {
                            "attrs": {
                                "fo": {
                                    "x": -4,
                                    "y": -4,
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "width": 8,
                                    "height": 8,
                                    "magnet": "true"
                                },
                                "circle": {
                                    "r": 2,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        },
                        "dc": {
                            "attrs": {
                                "fo": {
                                    "x": -4,
                                    "y": -4,
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "width": 8,
                                    "height": 8,
                                    "magnet": "true"
                                },
                                "circle": {
                                    "r": 2,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        },
                        "modbus": {
                            "attrs": {
                                "fo": {
                                    "x": -4,
                                    "y": -4,
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "width": 8,
                                    "height": 8,
                                    "magnet": "true"
                                },
                                "circle": {
                                    "r": 2,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        },
                        "dynamic": {
                            "attrs": {
                                "circle": {
                                    "r": 0,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        },
                        "unlimited": {
                            "attrs": {
                                "fo": {
                                    "x": -4,
                                    "y": -4,
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "width": 8,
                                    "height": 8,
                                    "magnet": "true"
                                },
                                "circle": {
                                    "r": 2,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        }
                    }
                },
                "portMarkup": [
                    {
                        "tagName": "foreignObject",
                        "children": [
                            {
                                "ns": "http://www.w3.org/1999/xhtml",
                                "attrs": {
                                    "xmlns": "http://www.w3.org/1999/xhtml"
                                },
                                "style": {
                                    "width": "100%",
                                    "height": "100%",
                                    "background": "transparent"
                                },
                                "tagName": "body",
                                "children": [
                                    {
                                        "style": {
                                            "width": "100%",
                                            "height": "100%"
                                        },
                                        "tagName": "div",
                                        "selector": "foContent"
                                    }
                                ],
                                "selector": "foBody"
                            }
                        ],
                        "selector": "fo"
                    }
                ],
                "angle": null,
                "zIndex": 6
            },
            {
                "id": "c22f8711-147f-48a9-ad6e-84ce4d0d2366",
                "name": null,
                "assetId": "XDLyBT6R",
                "type": null,
                "data": {
                    "dataAttr": [],
                    "deviceList": [
                        {
                            "templateId": "LoadTempL",
                            "templateName": "新能安&V2G&下党&回归-负荷单元",
                            "modelId": null,
                            "sourceModelId": "LoadU",
                            "rootTemplateId": null,
                            "deviceTag": null,
                            "inlineId": "zG0Lr0xy",
                            "modelLabel": "ELECTRICAL_LOAD",
                            "modelType": "",
                            "deviceId": "XDLyBT6R",
                            "deviceName": "#1负荷系统",
                            "deviceType": null,
                            "topology": {
                                "nodes": null,
                                "edges": null,
                                "graph": null,
                                "cells": null,
                                "topologyIndex": null
                            },
                            "nodeVisible": null,
                            "manufacturer": "系统内置",
                            "deviceCode": "下党低碳临港-负荷单元"
                        }
                    ],
                    "extra": {
                        "type": "BusinessMeasurement",
                        "label": "#1负荷系统",
                        "imgUrl": "/api/encompass/model/file/download/80e88023851b404d8b6961d3e7e25a79.svg",
                        "serial": 1,
                        "actions": [],
                        "inlineId": "5d441cef-0b73-4bae-8b45-d4d2c41df269",
                        "hideLabel": false,
                        "modelType": "LoadU",
                        "identifyType": "LoadTempL",
                        "modelCategory": "unit"
                    }
                },
                "position": {
                    "x": 585,
                    "y": 90
                },
                "size": {
                    "width": 80,
                    "height": 80
                },
                "attrs": {
                    "text": {
                        "text": "新能安&V2G&下党\n&回归-负荷单元1"
                    },
                    "image": {
                        "xlink:href": "/api/encompass/model/file/download/80e88023851b404d8b6961d3e7e25a79.svg?token=eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX3NldHRpbmdzIjp7InRoZW1lIjoiZGVmYXVsdCIsImxhbmciOiJ6aC1DTiJ9LCJ0ZW5hbnRfbmFtZSI6bnVsbCwidXNlcl9pZCI6MzQxMTk5LCJ1c2VyX2tleSI6Ijc5MTVmMjYwLTViOTAtNDA5OS1iYTYxLTFkYTIzMzc1Nzg5MyIsImRlcHRfaWQiOjIwMTksInJvbGVTZXQiOlsiYnl0MWpvcHFfYWRtaW4iXSwidGVuYW50LWlkIjoiYnl0MWpvcHEiLCJlbWFpbCI6IiIsImN1c3RvbWVyX3NldCI6bnVsbCwidXNlcm5hbWUiOiJieXQxam9wcV9hZG1pbiIsInRlbmFudF9jb2RlIjpudWxsfQ.-qagdcqeDArzG3AOyUvDI_IjE9G7aksg0huyu9zL2Mo",
                        "preserveAspectRatio": "none"
                    },
                    "label": {
                        "refX": 0.5,
                        "refY": "100%",
                        "text": "#1负荷系统",
                        "refY2": 4,
                        "display": "",
                        "textAnchor": "middle",
                        "textVerticalAnchor": "top"
                    }
                },
                "visible": true,
                "shape": "shape::custom::image",
                "children": null,
                "tools": {
                    "items": []
                },
                "ports": {
                    "items": [
                        {
                            "id": "923b9f87-ec43-4954-a36e-af3f8b5ae1b2",
                            "args": {
                                "x": 0.4976811000279018,
                                "y": 0.19991324288504464
                            },
                            "name": "连接",
                            "group": "unlimited"
                        }
                    ],
                    "groups": {
                        "ac": {
                            "attrs": {
                                "fo": {
                                    "x": -4,
                                    "y": -4,
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "width": 8,
                                    "height": 8,
                                    "magnet": "true"
                                },
                                "circle": {
                                    "r": 2,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        },
                        "dc": {
                            "attrs": {
                                "fo": {
                                    "x": -4,
                                    "y": -4,
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "width": 8,
                                    "height": 8,
                                    "magnet": "true"
                                },
                                "circle": {
                                    "r": 2,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        },
                        "modbus": {
                            "attrs": {
                                "fo": {
                                    "x": -4,
                                    "y": -4,
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "width": 8,
                                    "height": 8,
                                    "magnet": "true"
                                },
                                "circle": {
                                    "r": 2,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        },
                        "dynamic": {
                            "attrs": {
                                "circle": {
                                    "r": 0,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        },
                        "unlimited": {
                            "attrs": {
                                "fo": {
                                    "x": -4,
                                    "y": -4,
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "width": 8,
                                    "height": 8,
                                    "magnet": "true"
                                },
                                "circle": {
                                    "r": 2,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        }
                    }
                },
                "portMarkup": [
                    {
                        "tagName": "foreignObject",
                        "children": [
                            {
                                "ns": "http://www.w3.org/1999/xhtml",
                                "attrs": {
                                    "xmlns": "http://www.w3.org/1999/xhtml"
                                },
                                "style": {
                                    "width": "100%",
                                    "height": "100%",
                                    "background": "transparent"
                                },
                                "tagName": "body",
                                "children": [
                                    {
                                        "style": {
                                            "width": "100%",
                                            "height": "100%"
                                        },
                                        "tagName": "div",
                                        "selector": "foContent"
                                    }
                                ],
                                "selector": "foBody"
                            }
                        ],
                        "selector": "fo"
                    }
                ],
                "angle": null,
                "zIndex": 7
            },
            {
                "id": "5ebbc88d-9491-48ee-ace5-14142bdc326f",
                "name": null,
                "assetId": "IgqZb08p",
                "type": null,
                "data": {
                    "dataAttr": [],
                    "deviceList": [
                        {
                            "templateId": "LoadTempL",
                            "templateName": "新能安&V2G&下党&回归-负荷单元",
                            "modelId": null,
                            "sourceModelId": "LoadU",
                            "rootTemplateId": null,
                            "deviceTag": null,
                            "inlineId": "Embhy2fA",
                            "modelLabel": "ELECTRICAL_LOAD",
                            "modelType": "",
                            "deviceId": "IgqZb08p",
                            "deviceName": "#2负荷系统",
                            "deviceType": null,
                            "topology": {
                                "nodes": null,
                                "edges": null,
                                "graph": null,
                                "cells": null,
                                "topologyIndex": null
                            },
                            "nodeVisible": null,
                            "manufacturer": "系统内置",
                            "deviceCode": "下党低碳临港-负荷单元"
                        }
                    ],
                    "extra": {
                        "type": "BusinessMeasurement",
                        "label": "#2负荷系统",
                        "imgUrl": "/api/encompass/model/file/download/80e88023851b404d8b6961d3e7e25a79.svg",
                        "serial": 2,
                        "actions": [],
                        "inlineId": "a9d13373-e773-4754-8294-0e5225609dd7",
                        "hideLabel": false,
                        "modelType": "LoadU",
                        "identifyType": "LoadTempL",
                        "modelCategory": "unit"
                    }
                },
                "position": {
                    "x": 1340,
                    "y": 80
                },
                "size": {
                    "width": 80,
                    "height": 80
                },
                "attrs": {
                    "text": {
                        "text": "新能安&V2G&下党\n&回归-负荷单元2"
                    },
                    "image": {
                        "xlink:href": "/api/encompass/model/file/download/80e88023851b404d8b6961d3e7e25a79.svg?token=eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX3NldHRpbmdzIjp7InRoZW1lIjoiZGVmYXVsdCIsImxhbmciOiJ6aC1DTiJ9LCJ0ZW5hbnRfbmFtZSI6bnVsbCwidXNlcl9pZCI6MzQxMTk5LCJ1c2VyX2tleSI6Ijc5MTVmMjYwLTViOTAtNDA5OS1iYTYxLTFkYTIzMzc1Nzg5MyIsImRlcHRfaWQiOjIwMTksInJvbGVTZXQiOlsiYnl0MWpvcHFfYWRtaW4iXSwidGVuYW50LWlkIjoiYnl0MWpvcHEiLCJlbWFpbCI6IiIsImN1c3RvbWVyX3NldCI6bnVsbCwidXNlcm5hbWUiOiJieXQxam9wcV9hZG1pbiIsInRlbmFudF9jb2RlIjpudWxsfQ.-qagdcqeDArzG3AOyUvDI_IjE9G7aksg0huyu9zL2Mo",
                        "preserveAspectRatio": "none"
                    },
                    "label": {
                        "refX": 0.5,
                        "refY": "100%",
                        "text": "#2负荷系统",
                        "refY2": 4,
                        "display": "",
                        "textAnchor": "middle",
                        "textVerticalAnchor": "top"
                    }
                },
                "visible": true,
                "shape": "shape::custom::image",
                "children": null,
                "tools": {
                    "items": []
                },
                "ports": {
                    "items": [
                        {
                            "id": "923b9f87-ec43-4954-a36e-af3f8b5ae1b2",
                            "args": {
                                "x": 0.4976811000279018,
                                "y": 0.19991324288504464
                            },
                            "name": "连接",
                            "group": "unlimited"
                        }
                    ],
                    "groups": {
                        "ac": {
                            "attrs": {
                                "fo": {
                                    "x": -4,
                                    "y": -4,
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "width": 8,
                                    "height": 8,
                                    "magnet": "true"
                                },
                                "circle": {
                                    "r": 2,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        },
                        "dc": {
                            "attrs": {
                                "fo": {
                                    "x": -4,
                                    "y": -4,
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "width": 8,
                                    "height": 8,
                                    "magnet": "true"
                                },
                                "circle": {
                                    "r": 2,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        },
                        "modbus": {
                            "attrs": {
                                "fo": {
                                    "x": -4,
                                    "y": -4,
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "width": 8,
                                    "height": 8,
                                    "magnet": "true"
                                },
                                "circle": {
                                    "r": 2,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        },
                        "dynamic": {
                            "attrs": {
                                "circle": {
                                    "r": 0,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        },
                        "unlimited": {
                            "attrs": {
                                "fo": {
                                    "x": -4,
                                    "y": -4,
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "width": 8,
                                    "height": 8,
                                    "magnet": "true"
                                },
                                "circle": {
                                    "r": 2,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        }
                    }
                },
                "portMarkup": [
                    {
                        "tagName": "foreignObject",
                        "children": [
                            {
                                "ns": "http://www.w3.org/1999/xhtml",
                                "attrs": {
                                    "xmlns": "http://www.w3.org/1999/xhtml"
                                },
                                "style": {
                                    "width": "100%",
                                    "height": "100%",
                                    "background": "transparent"
                                },
                                "tagName": "body",
                                "children": [
                                    {
                                        "style": {
                                            "width": "100%",
                                            "height": "100%"
                                        },
                                        "tagName": "div",
                                        "selector": "foContent"
                                    }
                                ],
                                "selector": "foBody"
                            }
                        ],
                        "selector": "fo"
                    }
                ],
                "angle": null,
                "zIndex": 8
            },
            {
                "id": "59cfc32e-eadd-4edf-8a58-9bd2cff4d489",
                "name": null,
                "assetId": "AHb09Ixe",
                "type": null,
                "data": {
                    "dataAttr": [],
                    "deviceList": [
                        {
                            "templateId": "PVUStad",
                            "templateName": "新能安&V2G&下党&回归-标准光伏单元",
                            "modelId": null,
                            "sourceModelId": "PVU",
                            "rootTemplateId": null,
                            "deviceTag": null,
                            "inlineId": "zG0Lr0xy",
                            "modelLabel": "PHOTOVOLTAIC",
                            "modelType": "",
                            "deviceId": "AHb09Ixe",
                            "deviceName": "#1光伏系统",
                            "deviceType": null,
                            "topology": {
                                "nodes": null,
                                "edges": null,
                                "graph": null,
                                "cells": null,
                                "topologyIndex": null
                            },
                            "nodeVisible": null,
                            "manufacturer": "系统内置",
                            "deviceCode": "新能安&V2G&下党&回归-标准光伏单元"
                        }
                    ],
                    "extra": {
                        "type": "BusinessMeasurement",
                        "label": "#1光伏系统",
                        "imgUrl": "/api/encompass/model/file/download/光伏 (1)_20241211153739.svg",
                        "serial": 1,
                        "actions": [],
                        "inlineId": "5d441cef-0b73-4bae-8b45-d4d2c41df269",
                        "hideLabel": false,
                        "modelType": "PVU",
                        "identifyType": "PVUStad",
                        "modelCategory": "unit"
                    }
                },
                "position": {
                    "x": 305,
                    "y": 90
                },
                "size": {
                    "width": 80,
                    "height": 80
                },
                "attrs": {
                    "text": {
                        "text": "新能安&V2G&下党\n&回归-标准光伏单元\n1"
                    },
                    "image": {
                        "xlink:href": "/api/encompass/model/file/download/光伏 (1)_20241211153739.svg?token=eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX3NldHRpbmdzIjp7InRoZW1lIjoiZGVmYXVsdCIsImxhbmciOiJ6aC1DTiJ9LCJ0ZW5hbnRfbmFtZSI6bnVsbCwidXNlcl9pZCI6MzQxMTk5LCJ1c2VyX2tleSI6Ijc5MTVmMjYwLTViOTAtNDA5OS1iYTYxLTFkYTIzMzc1Nzg5MyIsImRlcHRfaWQiOjIwMTksInJvbGVTZXQiOlsiYnl0MWpvcHFfYWRtaW4iXSwidGVuYW50LWlkIjoiYnl0MWpvcHEiLCJlbWFpbCI6IiIsImN1c3RvbWVyX3NldCI6bnVsbCwidXNlcm5hbWUiOiJieXQxam9wcV9hZG1pbiIsInRlbmFudF9jb2RlIjpudWxsfQ.-qagdcqeDArzG3AOyUvDI_IjE9G7aksg0huyu9zL2Mo",
                        "preserveAspectRatio": "none"
                    },
                    "label": {
                        "refX": 0.5,
                        "refY": "100%",
                        "text": "#1光伏系统",
                        "refY2": 4,
                        "display": "",
                        "textAnchor": "middle",
                        "textVerticalAnchor": "top"
                    }
                },
                "visible": true,
                "shape": "shape::custom::image",
                "children": null,
                "tools": {
                    "items": []
                },
                "ports": {
                    "items": [
                        {
                            "id": "0b5f0bf2-583e-42d0-b3ac-1a2f5b7d8783",
                            "args": {
                                "x": 0.3993715995155262,
                                "y": 0.853984661721027
                            },
                            "name": "接电网AC口",
                            "group": "ac"
                        }
                    ],
                    "groups": {
                        "ac": {
                            "attrs": {
                                "fo": {
                                    "x": -4,
                                    "y": -4,
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "width": 8,
                                    "height": 8,
                                    "magnet": "true"
                                },
                                "circle": {
                                    "r": 2,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        },
                        "dc": {
                            "attrs": {
                                "fo": {
                                    "x": -4,
                                    "y": -4,
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "width": 8,
                                    "height": 8,
                                    "magnet": "true"
                                },
                                "circle": {
                                    "r": 2,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        },
                        "modbus": {
                            "attrs": {
                                "fo": {
                                    "x": -4,
                                    "y": -4,
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "width": 8,
                                    "height": 8,
                                    "magnet": "true"
                                },
                                "circle": {
                                    "r": 2,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        },
                        "dynamic": {
                            "attrs": {
                                "circle": {
                                    "r": 0,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        },
                        "unlimited": {
                            "attrs": {
                                "fo": {
                                    "x": -4,
                                    "y": -4,
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "width": 8,
                                    "height": 8,
                                    "magnet": "true"
                                },
                                "circle": {
                                    "r": 2,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        }
                    }
                },
                "portMarkup": [
                    {
                        "tagName": "foreignObject",
                        "children": [
                            {
                                "ns": "http://www.w3.org/1999/xhtml",
                                "attrs": {
                                    "xmlns": "http://www.w3.org/1999/xhtml"
                                },
                                "style": {
                                    "width": "100%",
                                    "height": "100%",
                                    "background": "transparent"
                                },
                                "tagName": "body",
                                "children": [
                                    {
                                        "style": {
                                            "width": "100%",
                                            "height": "100%"
                                        },
                                        "tagName": "div",
                                        "selector": "foContent"
                                    }
                                ],
                                "selector": "foBody"
                            }
                        ],
                        "selector": "fo"
                    }
                ],
                "angle": null,
                "zIndex": 9
            },
            {
                "id": "47f3d507-6d8b-4086-a9f6-946ac62c2a40",
                "name": null,
                "assetId": "TDIeFgff",
                "type": null,
                "data": {
                    "dataAttr": [],
                    "deviceList": [
                        {
                            "templateId": "PVUStad",
                            "templateName": "新能安&V2G&下党&回归-标准光伏单元",
                            "modelId": null,
                            "sourceModelId": "PVU",
                            "rootTemplateId": null,
                            "deviceTag": null,
                            "inlineId": "Embhy2fA",
                            "modelLabel": "PHOTOVOLTAIC",
                            "modelType": "",
                            "deviceId": "TDIeFgff",
                            "deviceName": "#2光伏系统",
                            "deviceType": null,
                            "topology": {
                                "nodes": null,
                                "edges": null,
                                "graph": null,
                                "cells": null,
                                "topologyIndex": null
                            },
                            "nodeVisible": null,
                            "manufacturer": "系统内置",
                            "deviceCode": "新能安&V2G&下党&回归-标准光伏单元"
                        }
                    ],
                    "extra": {
                        "type": "BusinessMeasurement",
                        "label": "#2光伏系统",
                        "imgUrl": "/api/encompass/model/file/download/光伏 (1)_20241211153739.svg",
                        "serial": 2,
                        "actions": [],
                        "inlineId": "a9d13373-e773-4754-8294-0e5225609dd7",
                        "hideLabel": false,
                        "modelType": "PVU",
                        "identifyType": "PVUStad",
                        "modelCategory": "unit"
                    }
                },
                "position": {
                    "x": 1010,
                    "y": 90
                },
                "size": {
                    "width": 80,
                    "height": 80
                },
                "attrs": {
                    "text": {
                        "text": "新能安&V2G&下党\n&回归-标准光伏单元\n2"
                    },
                    "image": {
                        "xlink:href": "/api/encompass/model/file/download/光伏 (1)_20241211153739.svg?token=eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX3NldHRpbmdzIjp7InRoZW1lIjoiZGVmYXVsdCIsImxhbmciOiJ6aC1DTiJ9LCJ0ZW5hbnRfbmFtZSI6bnVsbCwidXNlcl9pZCI6MzQxMTk5LCJ1c2VyX2tleSI6Ijc5MTVmMjYwLTViOTAtNDA5OS1iYTYxLTFkYTIzMzc1Nzg5MyIsImRlcHRfaWQiOjIwMTksInJvbGVTZXQiOlsiYnl0MWpvcHFfYWRtaW4iXSwidGVuYW50LWlkIjoiYnl0MWpvcHEiLCJlbWFpbCI6IiIsImN1c3RvbWVyX3NldCI6bnVsbCwidXNlcm5hbWUiOiJieXQxam9wcV9hZG1pbiIsInRlbmFudF9jb2RlIjpudWxsfQ.-qagdcqeDArzG3AOyUvDI_IjE9G7aksg0huyu9zL2Mo",
                        "preserveAspectRatio": "none"
                    },
                    "label": {
                        "refX": 0.5,
                        "refY": "100%",
                        "text": "#2光伏系统",
                        "refY2": 4,
                        "display": "",
                        "textAnchor": "middle",
                        "textVerticalAnchor": "top"
                    }
                },
                "visible": true,
                "shape": "shape::custom::image",
                "children": null,
                "tools": {
                    "items": []
                },
                "ports": {
                    "items": [
                        {
                            "id": "0b5f0bf2-583e-42d0-b3ac-1a2f5b7d8783",
                            "args": {
                                "x": 0.3993715995155262,
                                "y": 0.853984661721027
                            },
                            "name": "接电网AC口",
                            "group": "ac"
                        }
                    ],
                    "groups": {
                        "ac": {
                            "attrs": {
                                "fo": {
                                    "x": -4,
                                    "y": -4,
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "width": 8,
                                    "height": 8,
                                    "magnet": "true"
                                },
                                "circle": {
                                    "r": 2,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        },
                        "dc": {
                            "attrs": {
                                "fo": {
                                    "x": -4,
                                    "y": -4,
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "width": 8,
                                    "height": 8,
                                    "magnet": "true"
                                },
                                "circle": {
                                    "r": 2,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        },
                        "modbus": {
                            "attrs": {
                                "fo": {
                                    "x": -4,
                                    "y": -4,
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "width": 8,
                                    "height": 8,
                                    "magnet": "true"
                                },
                                "circle": {
                                    "r": 2,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        },
                        "dynamic": {
                            "attrs": {
                                "circle": {
                                    "r": 0,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        },
                        "unlimited": {
                            "attrs": {
                                "fo": {
                                    "x": -4,
                                    "y": -4,
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "width": 8,
                                    "height": 8,
                                    "magnet": "true"
                                },
                                "circle": {
                                    "r": 2,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        }
                    }
                },
                "portMarkup": [
                    {
                        "tagName": "foreignObject",
                        "children": [
                            {
                                "ns": "http://www.w3.org/1999/xhtml",
                                "attrs": {
                                    "xmlns": "http://www.w3.org/1999/xhtml"
                                },
                                "style": {
                                    "width": "100%",
                                    "height": "100%",
                                    "background": "transparent"
                                },
                                "tagName": "body",
                                "children": [
                                    {
                                        "style": {
                                            "width": "100%",
                                            "height": "100%"
                                        },
                                        "tagName": "div",
                                        "selector": "foContent"
                                    }
                                ],
                                "selector": "foBody"
                            }
                        ],
                        "selector": "fo"
                    }
                ],
                "angle": null,
                "zIndex": 10
            },
            {
                "id": "dc6d1d1f-3a78-4bb0-8a4d-e8ae28682ddf",
                "name": null,
                "assetId": "UVl0G8rx",
                "type": null,
                "data": {
                    "dataAttr": [],
                    "deviceList": [
                        {
                            "templateId": "ESUTempL",
                            "templateName": "新能安&V2G&下党&回归-下党_储能单元",
                            "modelId": null,
                            "sourceModelId": "ESU",
                            "rootTemplateId": null,
                            "deviceTag": null,
                            "inlineId": "zG0Lr0xy",
                            "modelLabel": "ENERGY_STORAGE",
                            "modelType": "",
                            "deviceId": "UVl0G8rx",
                            "deviceName": "#1储能系统",
                            "deviceType": null,
                            "topology": null,
                            "nodeVisible": null,
                            "manufacturer": "系统内置",
                            "deviceCode": "下党低碳临港-下党_储能单元"
                        }
                    ],
                    "extra": {
                        "type": "BusinessMeasurement",
                        "label": "#1储能系统",
                        "imgUrl": "/api/encompass/model/file/download/a40448bab1574447be00336fd069a3ee.svg",
                        "serial": 3,
                        "actions": [],
                        "assetId": "UVl0G8rx",
                        "inlineId": "5d441cef-0b73-4bae-8b45-d4d2c41df269",
                        "hideLabel": false,
                        "modelType": "ESU",
                        "identifyType": "ESUTempL",
                        "modelCategory": "unit"
                    }
                },
                "position": {
                    "x": 144.99999999999983,
                    "y": 94
                },
                "size": {
                    "width": 80,
                    "height": 72
                },
                "attrs": {
                    "text": {
                        "text": "新能安&V2G&下党\n&回归-下党_储能单\n元3"
                    },
                    "image": {
                        "xlink:href": "/api/encompass/model/file/download/a40448bab1574447be00336fd069a3ee.svg?token=eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX3NldHRpbmdzIjp7InRoZW1lIjoiZGVmYXVsdCIsImxhbmciOiJ6aC1DTiJ9LCJ0ZW5hbnRfbmFtZSI6bnVsbCwidXNlcl9pZCI6MzQxMTk5LCJ1c2VyX2tleSI6Ijc5MTVmMjYwLTViOTAtNDA5OS1iYTYxLTFkYTIzMzc1Nzg5MyIsImRlcHRfaWQiOjIwMTksInJvbGVTZXQiOlsiYnl0MWpvcHFfYWRtaW4iXSwidGVuYW50LWlkIjoiYnl0MWpvcHEiLCJlbWFpbCI6IiIsImN1c3RvbWVyX3NldCI6bnVsbCwidXNlcm5hbWUiOiJieXQxam9wcV9hZG1pbiIsInRlbmFudF9jb2RlIjpudWxsfQ.-qagdcqeDArzG3AOyUvDI_IjE9G7aksg0huyu9zL2Mo",
                        "preserveAspectRatio": "none"
                    },
                    "label": {
                        "refX": 0.5,
                        "refY": "100%",
                        "text": "#1储能系统",
                        "refY2": 4,
                        "display": "",
                        "textAnchor": "middle",
                        "textVerticalAnchor": "top"
                    }
                },
                "visible": true,
                "shape": "shape::custom::image",
                "children": null,
                "tools": {
                    "items": []
                },
                "ports": {
                    "items": [
                        {
                            "id": "ce48c4a4-a9ae-42c4-bedc-6b8052ba535b",
                            "args": {
                                "x": 0.5405382428850446,
                                "y": 0.06340535481770833
                            },
                            "name": "连接",
                            "group": "unlimited"
                        }
                    ],
                    "groups": {
                        "ac": {
                            "attrs": {
                                "fo": {
                                    "x": -4,
                                    "y": -4,
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "width": 8,
                                    "height": 8,
                                    "magnet": "true"
                                },
                                "circle": {
                                    "r": 2,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        },
                        "dc": {
                            "attrs": {
                                "fo": {
                                    "x": -4,
                                    "y": -4,
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "width": 8,
                                    "height": 8,
                                    "magnet": "true"
                                },
                                "circle": {
                                    "r": 2,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        },
                        "modbus": {
                            "attrs": {
                                "fo": {
                                    "x": -4,
                                    "y": -4,
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "width": 8,
                                    "height": 8,
                                    "magnet": "true"
                                },
                                "circle": {
                                    "r": 2,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        },
                        "dynamic": {
                            "attrs": {
                                "circle": {
                                    "r": 0,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        },
                        "unlimited": {
                            "attrs": {
                                "fo": {
                                    "x": -4,
                                    "y": -4,
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "width": 8,
                                    "height": 8,
                                    "magnet": "true"
                                },
                                "circle": {
                                    "r": 2,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        }
                    }
                },
                "portMarkup": [
                    {
                        "tagName": "foreignObject",
                        "children": [
                            {
                                "ns": "http://www.w3.org/1999/xhtml",
                                "attrs": {
                                    "xmlns": "http://www.w3.org/1999/xhtml"
                                },
                                "style": {
                                    "width": "100%",
                                    "height": "100%",
                                    "background": "transparent"
                                },
                                "tagName": "body",
                                "children": [
                                    {
                                        "style": {
                                            "width": "100%",
                                            "height": "100%"
                                        },
                                        "tagName": "div",
                                        "selector": "foContent"
                                    }
                                ],
                                "selector": "foBody"
                            }
                        ],
                        "selector": "fo"
                    }
                ],
                "angle": null,
                "zIndex": 23
            },
            {
                "id": "04b63c3b-11c4-4c89-b202-6274fac16e0a",
                "name": null,
                "assetId": "9zEUcGHv",
                "type": null,
                "data": {
                    "dataAttr": [],
                    "deviceList": [
                        {
                            "templateId": "aAbAFcfR",
                            "templateName": "锦州阳光气象_PC-2-T2型",
                            "modelId": null,
                            "sourceModelId": "ws",
                            "rootTemplateId": null,
                            "deviceTag": null,
                            "inlineId": null,
                            "modelLabel": "WEATHER",
                            "modelType": null,
                            "deviceId": "9zEUcGHv",
                            "deviceName": "光伏环境监测仪",
                            "deviceType": null,
                            "topology": null,
                            "nodeVisible": true,
                            "manufacturer": "锦州阳光气象",
                            "deviceCode": "PC-2-T2型"
                        }
                    ],
                    "extra": {
                        "type": "BusinessMeasurement",
                        "label": "光伏环境监测仪",
                        "imgUrl": "/api/encompass/model/file/download/5d547cbc74964a239c8312db6f93fb43.svg",
                        "serial": 1,
                        "actions": [],
                        "inlineId": null,
                        "hideLabel": false,
                        "modelType": "ws",
                        "identifyType": "aAbAFcfR",
                        "modelCategory": "device"
                    }
                },
                "position": {
                    "x": 1445,
                    "y": -255
                },
                "size": {
                    "width": 80,
                    "height": 80
                },
                "attrs": {
                    "text": {
                        "text": "锦州阳光气象_PC-\n2-T2型1"
                    },
                    "image": {
                        "xlink:href": "/api/encompass/model/file/download/5d547cbc74964a239c8312db6f93fb43.svg?token=eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX3NldHRpbmdzIjp7InRoZW1lIjoiZGVmYXVsdCIsImxhbmciOiJ6aC1DTiJ9LCJ0ZW5hbnRfbmFtZSI6bnVsbCwidXNlcl9pZCI6MzQxMTk5LCJ1c2VyX2tleSI6Ijc5MTVmMjYwLTViOTAtNDA5OS1iYTYxLTFkYTIzMzc1Nzg5MyIsImRlcHRfaWQiOjIwMTksInJvbGVTZXQiOlsiYnl0MWpvcHFfYWRtaW4iXSwidGVuYW50LWlkIjoiYnl0MWpvcHEiLCJlbWFpbCI6IiIsImN1c3RvbWVyX3NldCI6bnVsbCwidXNlcm5hbWUiOiJieXQxam9wcV9hZG1pbiIsInRlbmFudF9jb2RlIjpudWxsfQ.-qagdcqeDArzG3AOyUvDI_IjE9G7aksg0huyu9zL2Mo",
                        "preserveAspectRatio": "none"
                    },
                    "label": {
                        "refX": 0.5,
                        "refY": "100%",
                        "text": "光伏环境监测仪",
                        "refY2": 4,
                        "display": "",
                        "textAnchor": "middle",
                        "textVerticalAnchor": "top"
                    }
                },
                "visible": true,
                "shape": "shape::custom::image",
                "children": null,
                "tools": {
                    "items": []
                },
                "ports": {
                    "items": [
                        {
                            "id": "ad6fbd04-f0b7-42e0-b48b-f104e676cf60",
                            "args": {
                                "x": 0.5023809523809524,
                                "y": 0.016666666666666666
                            },
                            "name": "LJ",
                            "group": "unlimited"
                        }
                    ],
                    "groups": {
                        "ac": {
                            "attrs": {
                                "fo": {
                                    "x": -4,
                                    "y": -4,
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "width": 8,
                                    "height": 8,
                                    "magnet": "true"
                                },
                                "circle": {
                                    "r": 2,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        },
                        "dc": {
                            "attrs": {
                                "fo": {
                                    "x": -4,
                                    "y": -4,
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "width": 8,
                                    "height": 8,
                                    "magnet": "true"
                                },
                                "circle": {
                                    "r": 2,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        },
                        "modbus": {
                            "attrs": {
                                "fo": {
                                    "x": -4,
                                    "y": -4,
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "width": 8,
                                    "height": 8,
                                    "magnet": "true"
                                },
                                "circle": {
                                    "r": 2,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        },
                        "dynamic": {
                            "attrs": {
                                "circle": {
                                    "r": 0,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        },
                        "unlimited": {
                            "attrs": {
                                "fo": {
                                    "x": -4,
                                    "y": -4,
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "width": 8,
                                    "height": 8,
                                    "magnet": "true"
                                },
                                "circle": {
                                    "r": 2,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        }
                    }
                },
                "portMarkup": [
                    {
                        "tagName": "foreignObject",
                        "children": [
                            {
                                "ns": "http://www.w3.org/1999/xhtml",
                                "attrs": {
                                    "xmlns": "http://www.w3.org/1999/xhtml"
                                },
                                "style": {
                                    "width": "100%",
                                    "height": "100%",
                                    "background": "transparent"
                                },
                                "tagName": "body",
                                "children": [
                                    {
                                        "style": {
                                            "width": "100%",
                                            "height": "100%"
                                        },
                                        "tagName": "div",
                                        "selector": "foContent"
                                    }
                                ],
                                "selector": "foBody"
                            }
                        ],
                        "selector": "fo"
                    }
                ],
                "angle": null,
                "zIndex": 25
            }
        ],
        "edges": [
            {
                "id": "e96cc78d-3831-4d7f-b820-af7e3db8b7e5",
                "source": {
                    "cell": "5d441cef-0b73-4bae-8b45-d4d2c41df269",
                    "port": "c05c25d2-cafb-40b6-8bc7-e3c5bb6d80e2",
                    "x": null,
                    "y": null
                },
                "target": {
                    "cell": "cb44c5f1-678f-4ba8-b84a-b0694fad1387",
                    "port": "gKtE9IJ5BG6kbEhrnpJ64",
                    "x": null,
                    "y": null
                },
                "shape": "edge",
                "attrs": {
                    "line": {
                        "direction": 1,
                        "strokeWidth": 1,
                        "sourceMarker": {
                            "name": "",
                            "width": 0,
                            "height": 0
                        },
                        "targetMarker": {
                            "name": "block",
                            "width": 12,
                            "height": 8
                        }
                    }
                },
                "tools": null,
                "router": null,
                "pathPoints": [
                    {
                        "x": 409.43,
                        "y": -185.1
                    },
                    {
                        "x": 409.43,
                        "y": -115.55
                    },
                    {
                        "x": 403.92,
                        "y": -115.55
                    },
                    {
                        "x": 403.92,
                        "y": -46
                    }
                ],
                "vertices": null,
                "data": null,
                "zIndex": 12
            },
            {
                "id": "2fdb19bc-f34d-4e5b-b1be-1a55b99bacfc",
                "source": {
                    "cell": "cb44c5f1-678f-4ba8-b84a-b0694fad1387",
                    "port": "miI1Ypm04-IqFutjyh5aJ",
                    "x": null,
                    "y": null
                },
                "target": {
                    "cell": "59cfc32e-eadd-4edf-8a58-9bd2cff4d489",
                    "port": "0b5f0bf2-583e-42d0-b3ac-1a2f5b7d8783",
                    "x": null,
                    "y": null
                },
                "shape": "edge",
                "attrs": {
                    "line": {
                        "direction": 1,
                        "strokeWidth": 1,
                        "sourceMarker": {
                            "name": "",
                            "width": 0,
                            "height": 0
                        },
                        "targetMarker": {
                            "name": "block",
                            "width": 12,
                            "height": 8
                        }
                    }
                },
                "tools": null,
                "router": null,
                "pathPoints": [
                    {
                        "x": 378.84,
                        "y": -50
                    },
                    {
                        "x": 336.95,
                        "y": -50
                    },
                    {
                        "x": 336.95,
                        "y": 153.32
                    }
                ],
                "vertices": null,
                "data": null,
                "zIndex": 14
            },
            {
                "id": "cefbf0f2-ed4d-459e-ab49-9b32d7882bc5",
                "source": {
                    "cell": "cb44c5f1-678f-4ba8-b84a-b0694fad1387",
                    "port": "xlRTZcScrBw3t2bLgBstl",
                    "x": null,
                    "y": null
                },
                "target": {
                    "cell": "355d2b9a-c529-4cc6-be71-71bf439b3887",
                    "port": "ecf0dbb9-d35f-4a16-9aaf-4c1715e95189",
                    "x": null,
                    "y": null
                },
                "shape": "edge",
                "attrs": {
                    "line": {
                        "direction": 1,
                        "strokeWidth": 1,
                        "sourceMarker": {
                            "name": "",
                            "width": 0,
                            "height": 0
                        },
                        "targetMarker": {
                            "name": "block",
                            "width": 12,
                            "height": 8
                        }
                    }
                },
                "tools": null,
                "router": null,
                "pathPoints": [
                    {
                        "x": 559.48,
                        "y": -45
                    },
                    {
                        "x": 489.43,
                        "y": -45
                    },
                    {
                        "x": 489.43,
                        "y": 91.6
                    }
                ],
                "vertices": null,
                "data": null,
                "zIndex": 15
            },
            {
                "id": "f7ed3fce-7fa6-499d-93a3-1cb0e5a0a2ff",
                "source": {
                    "cell": "cb44c5f1-678f-4ba8-b84a-b0694fad1387",
                    "port": "zWMDahm_OMxYYjxj0ZJjx",
                    "x": null,
                    "y": null
                },
                "target": {
                    "cell": "c22f8711-147f-48a9-ad6e-84ce4d0d2366",
                    "port": "923b9f87-ec43-4954-a36e-af3f8b5ae1b2",
                    "x": null,
                    "y": null
                },
                "shape": "edge",
                "attrs": {
                    "line": {
                        "direction": 1,
                        "strokeWidth": 1,
                        "sourceMarker": {
                            "name": "",
                            "width": 0,
                            "height": 0
                        },
                        "targetMarker": {
                            "name": "block",
                            "width": 12,
                            "height": 8
                        }
                    }
                },
                "tools": null,
                "router": null,
                "pathPoints": [
                    {
                        "x": 604.62,
                        "y": -45
                    },
                    {
                        "x": 624.81,
                        "y": -45
                    },
                    {
                        "x": 624.81,
                        "y": 100.99
                    }
                ],
                "vertices": null,
                "data": null,
                "zIndex": 16
            },
            {
                "id": "8e3999c1-0e9e-4688-994e-37f027ad56eb",
                "source": {
                    "cell": "a9d13373-e773-4754-8294-0e5225609dd7",
                    "port": "c05c25d2-cafb-40b6-8bc7-e3c5bb6d80e2",
                    "x": null,
                    "y": null
                },
                "target": {
                    "cell": "4a62ef31-1507-40ec-b1e6-8e15a5821cbe",
                    "port": "4OCsAjD7b4t4vjjjwEBjp",
                    "x": null,
                    "y": null
                },
                "shape": "edge",
                "attrs": {
                    "line": {
                        "direction": 1,
                        "strokeWidth": 1,
                        "sourceMarker": {
                            "name": "",
                            "width": 0,
                            "height": 0
                        },
                        "targetMarker": {
                            "name": "block",
                            "width": 12,
                            "height": 8
                        }
                    }
                },
                "tools": null,
                "router": null,
                "pathPoints": [
                    {
                        "x": 1096.93,
                        "y": -185.1
                    },
                    {
                        "x": 1096.93,
                        "y": -118.05
                    },
                    {
                        "x": 1100,
                        "y": -118.05
                    },
                    {
                        "x": 1100,
                        "y": -51
                    }
                ],
                "vertices": null,
                "data": null,
                "zIndex": 18
            },
            {
                "id": "5bc6aacb-c211-4d92-85cc-91fd75dd8792",
                "source": {
                    "cell": "4a62ef31-1507-40ec-b1e6-8e15a5821cbe",
                    "port": "68pa9p0fHmd57BxTuCnmj",
                    "x": null,
                    "y": null
                },
                "target": {
                    "cell": "b476c93a-c6bd-47c1-befe-8147ec7ea6fa",
                    "port": "ce48c4a4-a9ae-42c4-bedc-6b8052ba535b",
                    "x": null,
                    "y": null
                },
                "shape": "edge",
                "attrs": {
                    "line": {
                        "direction": 1,
                        "strokeWidth": 1,
                        "sourceMarker": {
                            "name": "",
                            "width": 0,
                            "height": 0
                        },
                        "targetMarker": {
                            "name": "block",
                            "width": 12,
                            "height": 8
                        }
                    }
                },
                "tools": null,
                "router": null,
                "pathPoints": [
                    {
                        "x": 870,
                        "y": -49
                    },
                    {
                        "x": 870,
                        "y": 75
                    },
                    {
                        "x": 873.2,
                        "y": 75
                    },
                    {
                        "x": 873.23,
                        "y": 90.07
                    }
                ],
                "vertices": null,
                "data": null,
                "zIndex": 19
            },
            {
                "id": "1a1d61d5-dc45-4639-933e-b358b65ea5f5",
                "source": {
                    "cell": "4a62ef31-1507-40ec-b1e6-8e15a5821cbe",
                    "port": "rSLl0GL-_gCuIoofVyg_z",
                    "x": null,
                    "y": null
                },
                "target": {
                    "cell": "47f3d507-6d8b-4086-a9f6-946ac62c2a40",
                    "port": "0b5f0bf2-583e-42d0-b3ac-1a2f5b7d8783",
                    "x": null,
                    "y": null
                },
                "shape": "edge",
                "attrs": {
                    "line": {
                        "direction": 1,
                        "strokeWidth": 1,
                        "sourceMarker": {
                            "name": "",
                            "width": 0,
                            "height": 0
                        },
                        "targetMarker": {
                            "name": "block",
                            "width": 12,
                            "height": 8
                        }
                    }
                },
                "tools": null,
                "router": null,
                "pathPoints": [
                    {
                        "x": 1040,
                        "y": -49
                    },
                    {
                        "x": 1040,
                        "y": 52.16
                    },
                    {
                        "x": 1041.95,
                        "y": 52.16
                    },
                    {
                        "x": 1041.95,
                        "y": 153.32
                    }
                ],
                "vertices": null,
                "data": null,
                "zIndex": 20
            },
            {
                "id": "ecff184f-8930-484a-9b65-6c829222a9a2",
                "source": {
                    "cell": "4a62ef31-1507-40ec-b1e6-8e15a5821cbe",
                    "port": "dhkI9wxfWRVPCMY6W1NKM",
                    "x": null,
                    "y": null
                },
                "target": {
                    "cell": "029cf8d0-1a5f-4d65-a38f-18c3f8b7423f",
                    "port": "ecf0dbb9-d35f-4a16-9aaf-4c1715e95189",
                    "x": null,
                    "y": null
                },
                "shape": "edge",
                "attrs": {
                    "line": {
                        "direction": 1,
                        "strokeWidth": 1,
                        "sourceMarker": {
                            "name": "",
                            "width": 0,
                            "height": 0
                        },
                        "targetMarker": {
                            "name": "block",
                            "width": 12,
                            "height": 8
                        }
                    }
                },
                "tools": null,
                "router": null,
                "pathPoints": [
                    {
                        "x": 1210,
                        "y": -49
                    },
                    {
                        "x": 1210,
                        "y": 75
                    },
                    {
                        "x": 1214.4,
                        "y": 75
                    },
                    {
                        "x": 1214.42,
                        "y": 91.6
                    }
                ],
                "vertices": null,
                "data": null,
                "zIndex": 21
            },
            {
                "id": "5a7e7e86-0667-4aa4-ad8f-712dec8ed302",
                "source": {
                    "cell": "4a62ef31-1507-40ec-b1e6-8e15a5821cbe",
                    "port": "d4W3upd647YJtXf5BQsNJ",
                    "x": null,
                    "y": null
                },
                "target": {
                    "cell": "5ebbc88d-9491-48ee-ace5-14142bdc326f",
                    "port": "923b9f87-ec43-4954-a36e-af3f8b5ae1b2",
                    "x": null,
                    "y": null
                },
                "shape": "edge",
                "attrs": {
                    "line": {
                        "direction": 1,
                        "strokeWidth": 1,
                        "sourceMarker": {
                            "name": "",
                            "width": 0,
                            "height": 0
                        },
                        "targetMarker": {
                            "name": "block",
                            "width": 12,
                            "height": 8
                        }
                    }
                },
                "tools": null,
                "router": null,
                "pathPoints": [
                    {
                        "x": 1380,
                        "y": -49
                    },
                    {
                        "x": 1380,
                        "y": 20.99
                    },
                    {
                        "x": 1379.81,
                        "y": 20.99
                    },
                    {
                        "x": 1379.81,
                        "y": 90.99
                    }
                ],
                "vertices": null,
                "data": null,
                "zIndex": 22
            },
            {
                "id": "d385deae-ffac-444f-aea5-a41f708d1bd5",
                "source": {
                    "cell": "cb44c5f1-678f-4ba8-b84a-b0694fad1387",
                    "port": "SD8ANXMQXJULvh8x_CFng",
                    "x": null,
                    "y": null
                },
                "target": {
                    "cell": "dc6d1d1f-3a78-4bb0-8a4d-e8ae28682ddf",
                    "port": "ce48c4a4-a9ae-42c4-bedc-6b8052ba535b",
                    "x": null,
                    "y": null
                },
                "shape": "edge",
                "attrs": {
                    "line": {
                        "direction": 1,
                        "strokeWidth": 1,
                        "sourceMarker": {
                            "name": "",
                            "width": 0,
                            "height": 0
                        },
                        "targetMarker": {
                            "name": "block",
                            "width": 12,
                            "height": 8
                        }
                    }
                },
                "tools": null,
                "router": null,
                "pathPoints": [
                    {
                        "x": 185,
                        "y": -44
                    },
                    {
                        "x": 185,
                        "y": 24.78
                    },
                    {
                        "x": 188.24,
                        "y": 24.78
                    },
                    {
                        "x": 188.24,
                        "y": 93.57
                    }
                ],
                "vertices": null,
                "data": null,
                "zIndex": 24
            }
        ],
        "graph": {
            "color": "#ebebeb"
        },
        "cells": [
            {
                "id": "cb44c5f1-678f-4ba8-b84a-b0694fad1387",
                "name": null,
                "assetId": null,
                "type": null,
                "data": {
                    "dataAttr": null,
                    "deviceList": null,
                    "extra": {
                        "bus": 1,
                        "type": "BUS",
                        "inlineId": null,
                        "validate": "ac",
                        "validateNum": 6
                    }
                },
                "position": {
                    "x": 144.99999999999983,
                    "y": -50
                },
                "size": {
                    "width": 560,
                    "height": 10
                },
                "attrs": {},
                "visible": true,
                "shape": "shape::custom::rect_bus",
                "children": null,
                "tools": null,
                "ports": {
                    "items": [
                        {
                            "id": "gKtE9IJ5BG6kbEhrnpJ64",
                            "args": {
                                "x": 0.46236559139784944,
                                "y": 0.5
                            },
                            "group": "dynamic"
                        },
                        {
                            "id": "miI1Ypm04-IqFutjyh5aJ",
                            "args": {
                                "x": 0.41935483870967744,
                                "y": 0
                            },
                            "group": "dynamic"
                        },
                        {
                            "id": "xlRTZcScrBw3t2bLgBstl",
                            "args": {
                                "x": 0.7419354838709677,
                                "y": 0.5
                            },
                            "group": "dynamic"
                        },
                        {
                            "id": "zWMDahm_OMxYYjxj0ZJjx",
                            "args": {
                                "x": 0.8189655172413796,
                                "y": 0.5
                            },
                            "group": "dynamic"
                        },
                        {
                            "id": "SD8ANXMQXJULvh8x_CFng",
                            "args": {
                                "x": 0.07142857142857173,
                                "y": 0.5
                            },
                            "group": "dynamic"
                        }
                    ],
                    "groups": {
                        "ac": {
                            "attrs": {
                                "fo": {
                                    "x": -4,
                                    "y": -4,
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "width": 8,
                                    "height": 8,
                                    "magnet": "true"
                                },
                                "circle": {
                                    "r": 2,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        },
                        "dc": {
                            "attrs": {
                                "fo": {
                                    "x": -4,
                                    "y": -4,
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "width": 8,
                                    "height": 8,
                                    "magnet": "true"
                                },
                                "circle": {
                                    "r": 2,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        },
                        "modbus": {
                            "attrs": {
                                "fo": {
                                    "x": -4,
                                    "y": -4,
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "width": 8,
                                    "height": 8,
                                    "magnet": "true"
                                },
                                "circle": {
                                    "r": 2,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        },
                        "dynamic": {
                            "attrs": {
                                "circle": {
                                    "r": 0,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        },
                        "unlimited": {
                            "attrs": {
                                "fo": {
                                    "x": -4,
                                    "y": -4,
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "width": 8,
                                    "height": 8,
                                    "magnet": "true"
                                },
                                "circle": {
                                    "r": 2,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        }
                    }
                },
                "portMarkup": null,
                "angle": null,
                "zIndex": 11
            },
            {
                "id": "4a62ef31-1507-40ec-b1e6-8e15a5821cbe",
                "name": null,
                "assetId": null,
                "type": null,
                "data": {
                    "dataAttr": null,
                    "deviceList": null,
                    "extra": {
                        "bus": 1,
                        "type": "BUS",
                        "inlineId": null,
                        "validate": "ac",
                        "validateNum": 5
                    }
                },
                "position": {
                    "x": 800,
                    "y": -52.50000000000013
                },
                "size": {
                    "width": 635,
                    "height": 10
                },
                "attrs": {},
                "visible": true,
                "shape": "shape::custom::rect_bus",
                "children": null,
                "tools": null,
                "ports": {
                    "items": [
                        {
                            "id": "4OCsAjD7b4t4vjjjwEBjp",
                            "args": {
                                "x": 0.47244094488188976,
                                "y": 0.25000000000001277
                            },
                            "group": "dynamic"
                        },
                        {
                            "id": "68pa9p0fHmd57BxTuCnmj",
                            "args": {
                                "x": 0.11023622047244094,
                                "y": 0.25000000000001277
                            },
                            "group": "dynamic"
                        },
                        {
                            "id": "rSLl0GL-_gCuIoofVyg_z",
                            "args": {
                                "x": 0.3779527559055118,
                                "y": 0.25000000000001277
                            },
                            "group": "dynamic"
                        },
                        {
                            "id": "dhkI9wxfWRVPCMY6W1NKM",
                            "args": {
                                "x": 0.6456692913385826,
                                "y": 0.25000000000001277
                            },
                            "group": "dynamic"
                        },
                        {
                            "id": "d4W3upd647YJtXf5BQsNJ",
                            "args": {
                                "x": 0.9133858267716536,
                                "y": 0.25000000000001277
                            },
                            "group": "dynamic"
                        }
                    ],
                    "groups": {
                        "ac": {
                            "attrs": {
                                "fo": {
                                    "x": -4,
                                    "y": -4,
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "width": 8,
                                    "height": 8,
                                    "magnet": "true"
                                },
                                "circle": {
                                    "r": 2,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        },
                        "dc": {
                            "attrs": {
                                "fo": {
                                    "x": -4,
                                    "y": -4,
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "width": 8,
                                    "height": 8,
                                    "magnet": "true"
                                },
                                "circle": {
                                    "r": 2,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        },
                        "modbus": {
                            "attrs": {
                                "fo": {
                                    "x": -4,
                                    "y": -4,
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "width": 8,
                                    "height": 8,
                                    "magnet": "true"
                                },
                                "circle": {
                                    "r": 2,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        },
                        "dynamic": {
                            "attrs": {
                                "circle": {
                                    "r": 0,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        },
                        "unlimited": {
                            "attrs": {
                                "fo": {
                                    "x": -4,
                                    "y": -4,
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "width": 8,
                                    "height": 8,
                                    "magnet": "true"
                                },
                                "circle": {
                                    "r": 2,
                                    "fill": "none",
                                    "style": {
                                        "visibility": "hidden"
                                    },
                                    "magnet": true,
                                    "stroke": "none"
                                }
                            },
                            "position": {
                                "name": "absolute"
                            }
                        }
                    }
                },
                "portMarkup": null,
                "angle": null,
                "zIndex": 17
            },
            {
                "id": "5d441cef-0b73-4bae-8b45-d4d2c41df269-panel",
                "name": null,
                "assetId": null,
                "type": null,
                "data": {
                    "dataAttr": null,
                    "deviceList": null,
                    "extra": {
                        "fill": "#444",
                        "type": "InternalReactInfoPanel",
                        "assetId": "zG0Lr0xy",
                        "fontSize": 20,
                        "nodeAttr": [
                            {
                                "id": 23697,
                                "tag": null,
                                "name": "总有功功率",
                                "unit": null,
                                "modelId": "LI",
                                "tagList": null,
                                "dataType": {
                                    "type": "float",
                                    "specs": {
                                        "unit": "kW",
                                        "unitName": "千瓦"
                                    }
                                },
                                "required": false,
                                "tenantId": null,
                                "typeCode": "float",
                                "unitCode": "kW",
                                "unitName": "千瓦",
                                "dataValue": null,
                                "identifier": "P",
                                "modelLabel": null,
                                "typeCnName": "单精度浮点型",
                                "typeEnName": null,
                                "description": null,
                                "modelSource": 0,
                                "pointMapping": null,
                                "propertyType": 1,
                                "measurementType": 1,
                                "relatedIdentifier": null,
                                "relatedIdentifierName": null,
                                "relatedMeasurementType": null
                            },
                            {
                                "id": 23701,
                                "tag": null,
                                "name": "总无功功率",
                                "unit": null,
                                "modelId": "LI",
                                "tagList": null,
                                "dataType": {
                                    "type": "float",
                                    "specs": {
                                        "unit": "kVar",
                                        "unitName": "无功千伏安"
                                    }
                                },
                                "required": false,
                                "tenantId": null,
                                "typeCode": "float",
                                "unitCode": "kVar",
                                "unitName": "无功千伏安",
                                "dataValue": null,
                                "identifier": "Q",
                                "modelLabel": null,
                                "typeCnName": "单精度浮点型",
                                "typeEnName": null,
                                "description": null,
                                "modelSource": 0,
                                "pointMapping": null,
                                "propertyType": 1,
                                "measurementType": 1,
                                "relatedIdentifier": null,
                                "relatedIdentifierName": null,
                                "relatedMeasurementType": null
                            },
                            {
                                "id": 23705,
                                "tag": null,
                                "name": "总视在功率",
                                "unit": null,
                                "modelId": "LI",
                                "tagList": null,
                                "dataType": {
                                    "type": "float",
                                    "specs": {
                                        "unit": "kVA",
                                        "unitName": "千伏安"
                                    }
                                },
                                "required": false,
                                "tenantId": null,
                                "typeCode": "float",
                                "unitCode": "kVA",
                                "unitName": "千伏安",
                                "dataValue": null,
                                "identifier": "S",
                                "modelLabel": null,
                                "typeCnName": "单精度浮点型",
                                "typeEnName": null,
                                "description": null,
                                "modelSource": 0,
                                "pointMapping": null,
                                "propertyType": 1,
                                "measurementType": 1,
                                "relatedIdentifier": null,
                                "relatedIdentifierName": null,
                                "relatedMeasurementType": null
                            }
                        ]
                    }
                },
                "position": {
                    "x": 15,
                    "y": -265
                },
                "size": {
                    "width": 290,
                    "height": 100
                },
                "attrs": {},
                "visible": null,
                "shape": "enerv-topo-node-info-panel",
                "children": null,
                "tools": null,
                "ports": null,
                "portMarkup": null,
                "angle": null,
                "zIndex": 26
            },
            {
                "id": "a9d13373-e773-4754-8294-0e5225609dd7-panel",
                "name": null,
                "assetId": null,
                "type": null,
                "data": {
                    "dataAttr": null,
                    "deviceList": null,
                    "extra": {
                        "fill": "#444",
                        "type": "InternalReactInfoPanel",
                        "assetId": "Embhy2fA",
                        "fontSize": 20,
                        "nodeAttr": [
                            {
                                "id": 23697,
                                "tag": null,
                                "name": "总有功功率",
                                "unit": null,
                                "modelId": "LI",
                                "tagList": null,
                                "dataType": {
                                    "type": "float",
                                    "specs": {
                                        "unit": "kW",
                                        "unitName": "千瓦"
                                    }
                                },
                                "required": false,
                                "tenantId": null,
                                "typeCode": "float",
                                "unitCode": "kW",
                                "unitName": "千瓦",
                                "dataValue": null,
                                "identifier": "P",
                                "modelLabel": null,
                                "typeCnName": "单精度浮点型",
                                "typeEnName": null,
                                "description": null,
                                "modelSource": 0,
                                "pointMapping": null,
                                "propertyType": 1,
                                "measurementType": 1,
                                "relatedIdentifier": null,
                                "relatedIdentifierName": null,
                                "relatedMeasurementType": null
                            },
                            {
                                "id": 23704,
                                "tag": null,
                                "name": "C相无功功率",
                                "unit": null,
                                "modelId": "LI",
                                "tagList": null,
                                "dataType": {
                                    "type": "float",
                                    "specs": {
                                        "unit": "kVar",
                                        "unitName": "无功千伏安"
                                    }
                                },
                                "required": false,
                                "tenantId": null,
                                "typeCode": "float",
                                "unitCode": "kVar",
                                "unitName": "无功千伏安",
                                "dataValue": null,
                                "identifier": "Qc",
                                "modelLabel": null,
                                "typeCnName": "单精度浮点型",
                                "typeEnName": null,
                                "description": null,
                                "modelSource": 0,
                                "pointMapping": null,
                                "propertyType": 1,
                                "measurementType": 1,
                                "relatedIdentifier": null,
                                "relatedIdentifierName": null,
                                "relatedMeasurementType": null
                            },
                            {
                                "id": 23705,
                                "tag": null,
                                "name": "总视在功率",
                                "unit": null,
                                "modelId": "LI",
                                "tagList": null,
                                "dataType": {
                                    "type": "float",
                                    "specs": {
                                        "unit": "kVA",
                                        "unitName": "千伏安"
                                    }
                                },
                                "required": false,
                                "tenantId": null,
                                "typeCode": "float",
                                "unitCode": "kVA",
                                "unitName": "千伏安",
                                "dataValue": null,
                                "identifier": "S",
                                "modelLabel": null,
                                "typeCnName": "单精度浮点型",
                                "typeEnName": null,
                                "description": null,
                                "modelSource": 0,
                                "pointMapping": null,
                                "propertyType": 1,
                                "measurementType": 1,
                                "relatedIdentifier": null,
                                "relatedIdentifierName": null,
                                "relatedMeasurementType": null
                            }
                        ]
                    }
                },
                "position": {
                    "x": 762.5,
                    "y": -175
                },
                "size": {
                    "width": 280,
                    "height": 95
                },
                "attrs": {},
                "visible": null,
                "shape": "enerv-topo-node-info-panel",
                "children": null,
                "tools": null,
                "ports": null,
                "portMarkup": null,
                "angle": null,
                "zIndex": 27
            }
        ],
        "topologyIndex": null
    },
    "primary": 1
}