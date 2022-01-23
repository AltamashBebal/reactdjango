import React, { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useNavigation } from '@react-navigation/core';

import { useData, useTheme, useTranslation } from '../hooks';
import * as regex from '../constants/regex';
import { Block, Button, Input, Image, Text } from '../components';
import APIKit, { setClientToken } from '../utils/APIKit';

const isAndroid = Platform.OS === 'android';

interface ILogin {
  username: string;
  password: string;
}
interface ILoginValidation {
  username: boolean;
  password: boolean;
}

const Login = () => {
  const { isDark, user, handleUser } = useData();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [isValid, setIsValid] = useState<ILoginValidation>({
    username: false,
    password: false,
  });
  const [login, setLogin] = useState<ILogin>({
    username: '',
    password: '',
  });
  const { assets, colors, gradients, sizes } = useTheme();

  const handleChange = useCallback(
    (value) => {
      setLogin((state) => ({ ...state, ...value }));
    },
    [setLogin],
  );

  const handleSignIn = useCallback(async () => {
    if (!Object.values(isValid).includes(false)) {
      try {
        const {
          data: { auth_token },
        } = await APIKit.post('/token/login/', new URLSearchParams({ ...login }));
        console.log({ auth_token });
        setClientToken(auth_token);
        const { data: userData } = await APIKit.get('/users/me/');
        handleUser(userData);
        console.log({ userData });
        navigation.navigate('Home');
      } catch (error) {
        console.log(error);
      }

      console.log('handleSignIn', login);
    }
  }, [isValid, login]);

  useEffect(() => {
    setIsValid((state) => ({
      ...state,
      username: regex.name.test(login.username),
      password: regex.name.test(login.password),
    }));
  }, [login, setIsValid]);

  return (
    <Block safe marginTop={sizes.md}>
      <Block paddingHorizontal={sizes.s}>
        <Block flex={0} style={{ zIndex: 0 }}>
          <Image
            background
            resizeMode="cover"
            padding={sizes.sm}
            radius={sizes.cardRadius}
            source={assets.background}
            height={sizes.height * 0.3}>
            <Text h4 center white marginBottom={sizes.md}>
              {t('login.title')}
            </Text>
          </Image>
        </Block>
        {/* login form */}
        <Block
          keyboard
          behavior={!isAndroid ? 'padding' : 'height'}
          marginTop={-(sizes.height * 0.2 - sizes.l)}>
          <Block
            flex={0}
            radius={sizes.sm}
            marginHorizontal="8%"
            shadow={!isAndroid} // disabled shadow on Android due to blur overlay + elevation issue
          >
            <Block
              blur
              flex={0}
              intensity={90}
              radius={sizes.sm}
              overflow="hidden"
              justify="space-evenly"
              tint={colors.blurTint}
              paddingVertical={sizes.sm}>
              <Block paddingHorizontal={sizes.sm}>
                <Input
                  autoCapitalize="none"
                  marginBottom={sizes.m}
                  label={t('common.username')}
                  placeholder={t('common.usernamePlaceholder')}
                  success={Boolean(login.username && isValid.username)}
                  danger={Boolean(login.username && !isValid.username)}
                  onChangeText={(value) => handleChange({ username: value })}
                />
                <Input
                  secureTextEntry
                  autoCapitalize="none"
                  marginBottom={sizes.m}
                  label={t('common.password')}
                  placeholder={t('common.passwordPlaceholder')}
                  onChangeText={(value) => handleChange({ password: value })}
                  success={Boolean(login.password && isValid.password)}
                  danger={Boolean(login.password && !isValid.password)}
                />
              </Block>
              <Button
                primary
                outlined
                shadow={!isAndroid}
                marginVertical={sizes.s}
                marginHorizontal={sizes.sm}
                onPress={handleSignIn}
                disabled={Object.values(isValid).includes(false)}>
                <Text bold primary transform="uppercase">
                  {t('common.signin')}
                </Text>
              </Button>
            </Block>
          </Block>
        </Block>
      </Block>
    </Block>
  );
};

export default Login;
