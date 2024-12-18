import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import BottomTabNavigator from '../Navigation/BottomTabNavigator';
import {RootStackParamList} from '../../../../../App';
import {StackNavigationProp} from '@react-navigation/stack';
import {useNavigation} from '@react-navigation/native';
import {setItem, useUser} from '../UserContext.tsx';
import {DATA_URL} from '../../Constant.ts';
import path from 'path';
import {reqPost} from '../../utills/Request.ts';

type MypageNavigationProp = StackNavigationProp<RootStackParamList, 'Mypage'>;

const Mypage: React.FC = () => {
  const navigation = useNavigation<MypageNavigationProp>();
  const {userEmail, userName} = useUser();

  const workLogout = async () => {
    await setItem('userEmail', '');
    await setItem('userPwd', '');
    navigation.reset({routes: [{name: 'LognSignin'}]});
  };

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '로그아웃 하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '확인',
          onPress: () => workLogout(), // 함수 호출을 함수로 래핑
        },
      ],
      {cancelable: false},
    );
  };

  const handleWithdrawal = async () => {
    Alert.alert(
      '계정 삭제',
      '정말 삭제하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '확인',
          onPress: async () => {
            try {
              const response = await reqPost(
                path.join(DATA_URL, 'api', 'members', 'delete_id'),
                {userEmail},
              );

              if (response) {
                // 탈퇴 완료 알림
                Alert.alert(
                  '탈퇴 완료',
                  '회원탈퇴가 성공적으로 완료되었습니다.',
                );

                await workLogout();
              } else {
                console.error('회원탈퇴에 실패했습니다.');
              }
            } catch (error) {
              console.error('회원탈퇴 중 오류가 발생했습니다:', error);
            }
          },
        },
      ],
      {cancelable: false},
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.platformName}>마이페이지</Text>
          <View style={styles.cartButtonWrapper}>
            <TouchableOpacity
              style={styles.cartButton}
              onPress={() => navigation.navigate('Cart')}>
              <Image
                source={require('../../assets/img/main/shop.png')}
                style={styles.cartImage}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* 프로필 */}
        <View style={styles.section}>
          <Image
            source={require('../../assets/img/mypage/profile.png')}
            style={styles.profile}
          />
          <View style={styles.textWrapper}>
            <Text style={styles.name}>{userName}</Text>
            <Text style={styles.email}>{userEmail}</Text>
          </View>
        </View>
        <View style={styles.line} />

        {/* 구매내역 / 내 체형 정보 */}
        <View style={[styles.section, {marginBottom: -30}]}>
          <Image
            source={require('../../assets/img/mypage/buy.png')}
            style={styles.image}
          />
          <Text
            style={styles.text}
            onPress={() => navigation.navigate('Purchase')}>
            주문내역
          </Text>
        </View>

        <View style={styles.section}>
          <Image
            source={require('../../assets/img/mypage/camera.png')}
            style={styles.image}
          />
          <Text
            style={styles.text}
            onPress={() => navigation.navigate('My_Fit')}>
            내 체형 정보
          </Text>
        </View>
        <View style={styles.line} />

        {/* 핏보관함 / 내가 작성한 핏 코멘트 */}
        <View style={[styles.section, {marginBottom: -30}]}>
          <Image
            source={require('../../assets/img/mypage/fitbox.png')}
            style={styles.image}
          />
          <Text
            style={styles.text}
            onPress={() => navigation.navigate('Fit_box', {})}>
            핏 보관함
          </Text>
        </View>

        <View style={styles.section}>
          <Image
            source={require('../../assets/img/mypage/fitcomment.png')}
            style={styles.image}
          />
          <Text
            style={styles.text}
            onPress={() => navigation.navigate('WriteComment', {review: {}})}>
            내가 작성한 핏 코멘트
          </Text>
        </View>
        <View style={styles.line} />

        {/* 로그아웃 / 계정 삭제 */}
        <TouchableOpacity
          style={[styles.section, {marginBottom: -30}]}
          onPress={handleLogout}>
          <Image
            source={require('../../assets/img/mypage/logout.png')}
            style={styles.image}
          />
          <Text style={styles.logout}>로그아웃</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.section} onPress={handleWithdrawal}>
          <Image
            source={require('../../assets/img/mypage/leave.png')}
            style={styles.image}
          />
          <Text style={styles.withdrawal}>계정 삭제</Text>
        </TouchableOpacity>
        <View style={styles.line} />
      </View>
      <View>
        <BottomTabNavigator />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: '1%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '11%',
    paddingHorizontal: '5%',
  },
  platformName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
  cartButtonWrapper: {
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#F4F4F4',
    padding: '1.5%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartButton: {
    padding: 3,
  },
  cartImage: {
    width: 24,
    height: 24,
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: '5%',
    padding: '6.5%',
    marginTop: '3%',
    marginBottom: '3%',
  },
  profile: {
    width: 60,
    height: 60,
    marginRight: 10,
  },
  image: {
    width: 27,
    height: 27,
    left: '20%',
  },
  textWrapper: {
    flexDirection: 'column',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#000',
    paddingHorizontal: '5%',
  },
  email: {
    fontSize: 16,
    color: '#888',
    paddingHorizontal: '3%',
  },
  text: {
    fontSize: 19,
    color: '#000',
    paddingHorizontal: '5%',
  },
  line: {
    borderBottomWidth: 2.5,
    borderBottomColor: '#E9E9E9',
  },
  logout: {
    fontSize: 19,
    textAlign: 'center',
    color: '#000',
    paddingHorizontal: '5%',
  },
  withdrawal: {
    fontSize: 19,
    color: '#000',
    paddingHorizontal: '5%',
  },
});

export default Mypage;
