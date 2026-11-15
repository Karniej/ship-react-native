/** @format */

import { Text as DefaultText, View as DefaultView } from "react-native";

import { useTheme } from "expo-router/react-navigation";

export function Text(props: DefaultText["props"]) {
  const { style, ...otherProps } = props;
  const theme = useTheme();

  return <DefaultText style={[{ color: theme.colors.text }, style]} {...otherProps} />;
}

export function View(props: DefaultView["props"]) {
  const { style, ...otherProps } = props;
  const theme = useTheme();

  return (
    <DefaultView style={[{ backgroundColor: theme.colors.background }, style]} {...otherProps} />
  );
}
