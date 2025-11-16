import LinkifyIt from "linkify-it";
import React from "react";
import {
  Linking,
  StyleSheet,
  Text as RNText,
  type StyleProp,
  type TextProps,
  type TextStyle,
} from "react-native";

type HyperlinkProps = {
  children: React.ReactNode;
  linkStyle?: StyleProp<TextStyle>;
  pressedStyle?: StyleProp<TextStyle>;
  onPress?: (url: string) => void;
} & Pick<TextProps, "suppressHighlighting">;

const linkify = new LinkifyIt();

type ElementWithChildren = React.ReactElement<React.PropsWithChildren<unknown>>;

type HandlePress = (url: string) => void;

type InheritedTextProps = {
  style?: StyleProp<TextStyle>;
  className?: string;
};

export function Hyperlink({
  children,
  linkStyle,
  pressedStyle,
  onPress,
  suppressHighlighting = true,
}: HyperlinkProps) {
  const handlePress = React.useCallback(
    (url: string) => {
      if (onPress) {
        onPress(url);
        return;
      }

      Linking.openURL(url).catch((error) => {
        console.warn("Failed to open url", error);
      });
    },
    [onPress],
  );

  const processed = React.Children.map(children, (child, index) => {
    if (!React.isValidElement(child)) {
      return child;
    }

    return processElement(
      child as ElementWithChildren,
      `${index}`,
      linkStyle,
      pressedStyle,
      suppressHighlighting,
      handlePress,
    );
  });

  return <>{processed}</>;
}

function processElement(
  element: ElementWithChildren,
  keyPrefix: string,
  linkStyle: StyleProp<TextStyle> | undefined,
  pressedStyle: StyleProp<TextStyle> | undefined,
  suppressHighlighting: boolean,
  handlePress: HandlePress,
): ElementWithChildren {
  const childrenArray = React.Children.toArray(element.props.children);
  const inheritedProps = element.props as InheritedTextProps;

  let hasMatch = false;
  const nextChildren: React.ReactNode[] = [];

  childrenArray.forEach((child, childIndex) => {
    const { nodes, matched } = transformNode(
      child,
      `${keyPrefix}-${childIndex}`,
      linkStyle,
      pressedStyle,
      suppressHighlighting,
      handlePress,
      inheritedProps,
    );
    hasMatch = hasMatch || matched;
    nextChildren.push(...nodes);
  });

  if (!hasMatch) {
    return element;
  }

  return React.cloneElement(
    element,
    undefined,
    nextChildren,
  ) as ElementWithChildren;
}

function transformNode(
  node: React.ReactNode,
  keyPrefix: string,
  linkStyle: StyleProp<TextStyle> | undefined,
  pressedStyle: StyleProp<TextStyle> | undefined,
  suppressHighlighting: boolean,
  handlePress: HandlePress,
  inheritedProps: InheritedTextProps,
): { nodes: React.ReactNode[]; matched: boolean } {
  if (typeof node === "string") {
    const matches = linkify.match(node);
    if (!matches || matches.length === 0) {
      return { nodes: [node], matched: false };
    }

    const segments: React.ReactNode[] = [];
    let lastIndex = 0;

    matches.forEach((match, matchIndex) => {
      const start = match.index;
      const end =
        typeof match.lastIndex === "number"
          ? match.lastIndex
          : start + match.raw.length;

      if (start > lastIndex) {
        segments.push(node.slice(lastIndex, start));
      }

      const linkText = node.slice(start, end);

      segments.push(
        <HyperlinkText
          key={`link-${keyPrefix}-${matchIndex}`}
          url={match.url}
          linkStyle={linkStyle}
          pressedStyle={pressedStyle}
          suppressHighlighting={suppressHighlighting}
          onPress={handlePress}
          baseStyle={inheritedProps.style}
          baseClassName={inheritedProps.className}
        >
          {linkText}
        </HyperlinkText>,
      );

      lastIndex = end;
    });

    if (lastIndex < node.length) {
      segments.push(node.slice(lastIndex));
    }

    return { nodes: segments, matched: true };
  }

  if (React.isValidElement(node)) {
    const processed = processElement(
      node as ElementWithChildren,
      keyPrefix,
      linkStyle,
      pressedStyle,
      suppressHighlighting,
      handlePress,
    );

    return {
      nodes: [processed],
      matched: processed !== node,
    };
  }

  return { nodes: [node], matched: false };
}

type HyperlinkTextProps = {
  url: string;
  children: React.ReactNode;
  linkStyle?: StyleProp<TextStyle>;
  pressedStyle?: StyleProp<TextStyle>;
  suppressHighlighting: boolean;
  onPress: HandlePress;
  baseStyle?: StyleProp<TextStyle>;
  baseClassName?: string;
};

function HyperlinkText({
  url,
  children,
  linkStyle,
  pressedStyle,
  suppressHighlighting,
  onPress,
  baseStyle,
  baseClassName,
}: HyperlinkTextProps) {
  const [pressed, setPressed] = React.useState(false);

  const handlePress = React.useCallback(() => {
    onPress(url);
  }, [onPress, url]);

  const handlePressIn = React.useCallback(() => {
    setPressed(true);
  }, []);

  const handlePressOut = React.useCallback(() => {
    setPressed(false);
  }, []);

  return (
    <RNText
      suppressHighlighting={suppressHighlighting}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      className={baseClassName}
      style={[
        baseStyle,
        styles.link,
        linkStyle,
        pressed && styles.linkPressed,
        pressed && pressedStyle,
      ]}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  link: {
    color: "hsl(0 0% 98%)",
    textDecorationLine: "underline",
    textDecorationStyle: "solid",
    textDecorationColor: "hsl(0 0% 98%)",
  },
  linkPressed: {
    color: "hsl(0 0% 88%)",
  },
});
