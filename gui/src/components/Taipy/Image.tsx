/*
 * Copyright 2023 Avaiga Private Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

import React, { CSSProperties, useCallback, useContext, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";

import { TaipyContext } from "../../context/taipyContext";
import { createSendActionNameAction } from "../../context/taipyReducers";
import { useClassNames, useDynamicProperty } from "../../utils/hooks";
import { TaipyActiveProps } from "./utils";

interface ImageProps extends TaipyActiveProps {
    onAction?: string;
    label?: string;
    defaultLabel?: string;
    width?: string | number;
    height?: string | number;
    content?: string;
    defaultContent: string;
}

const labelSpanStyle = {
    overflow: "hidden",
    pointerEvents: "none",
    position: "absolute",
    zIndex: 0,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: "inherit",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
} as CSSProperties;

const Image = (props: ImageProps) => {
    const { id, onAction, width = 300, height } = props;
    const { dispatch } = useContext(TaipyContext);
    const divRef = useRef<HTMLDivElement>(null);

    const className = useClassNames(props.libClassName, props.dynamicClassName, props.className);
    const active = useDynamicProperty(props.active, props.defaultActive, true);
    const hover = useDynamicProperty(props.hoverText, props.defaultHoverText, undefined);
    const label = useDynamicProperty(props.label, props.defaultLabel, undefined);
    const content = useDynamicProperty(props.content, props.defaultContent, "");

    const handleClick = useCallback(() => {
        if (onAction) {
            dispatch(createSendActionNameAction(id, onAction));
        }
    }, [id, onAction, dispatch]);

    const [svg, svgContent, inlineSvg] = useMemo(() => {
        const p = (content || "").trim();
        if (p.length > 3) {
            const svgFile = p.substring(p.length - 4).toLowerCase() === ".svg";
            const svgXml = p.substring(0, 4).toLowerCase() === "<svg";
            return [svgFile && content, svgXml && content, svgFile || svgXml];
        }
        return [undefined, undefined, false];
    }, [content]);

    const style = useMemo(
        () => ({ width: width, height: height, display: inlineSvg ? "inline-block" : undefined }),
        [width, height, inlineSvg]
    );

    useEffect(() => {
        if (svg) {
            axios.get<string>(svg).then((response) => divRef.current && (divRef.current.innerHTML = response.data));
        } else if (svgContent && divRef.current) {
            divRef.current.innerHTML = svgContent;
        }
    }, [svg, svgContent]);

    return (
        <Tooltip title={hover || label}>
            {onAction ? (
                <Button
                    id={id}
                    className={className}
                    style={inlineSvg ? style : undefined}
                    onClick={handleClick}
                    aria-label={label}
                    variant="outlined"
                    disabled={!active}
                    title={label}
                >
                    {inlineSvg ? <div ref={divRef}/> : <img src={content} style={style} alt={label} />}
                </Button>
            ) : inlineSvg ? (
                <div id={id} className={className} style={style} ref={divRef} title={label}></div>
            ) : (
                <img id={id} src={content} style={style} className={className} alt={label} />
            )}
        </Tooltip>
    );
};

export default Image;
