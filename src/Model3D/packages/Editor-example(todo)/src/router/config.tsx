//  该文件专门用于统一管理路由

import Editor from "./Editor";
import Example from "./Home";
import React from "react";



const routes = [
    {
        path: "/",
        element: <Editor />
    },
    {
        path: "/editor",
        element: <Editor />
    },
    {
        path: "/example",
        element: <Example />,
        children: [
            {
                path: ':id',
                element: null
            }
        ]
    }
]
export default routes;
