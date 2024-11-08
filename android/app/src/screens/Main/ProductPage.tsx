import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TouchableWithoutFeedback, // 모달 외부 터치 감지용
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import { RootStackParamList } from '../../../../../App.tsx';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { AR_URL, DATA_URL } from '../../Constant.ts';
import path from 'path';
import { ArRequest, reqGet, reqPost } from '../../utills/Request.ts';
import { useUser } from '../UserContext.tsx';

type ProductPageoNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ProductPage'
>;

type ProductPageRouteProp = RouteProp<RootStackParamList, 'ProductPage'>;

type TopInfoType = {
  itemSize: string;
  itemHeight: number;
  itemShoulder: number;
  itemChest: number;
  itemSleeve: number;
};

type BottomInfoType = {
  itemSize: string;
  itemHeight: number;
  frontRise: number;
  itemWaists: number;
  itemHipWidth: number;
  itemThighs: number;
  itemHemWidth: number;
};

const ProductPage = () => {
  const navigation = useNavigation<ProductPageoNavigationProp>();
  const route = useRoute<ProductPageRouteProp>(); // route의 타입을 지정
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sizeData, setSizeData] = useState<any>(null);
  const [recommendedSize, setRecommendedSize] = useState<TopInfoType | BottomInfoType | null>(null);
  const [length, setLength] = useState(0);
  const [shoulder, setShoulder] = useState(0);
  const [chest, setChest] = useState(0);
  const [sleeve, setSleeve] = useState(0);
  const [bottomLength, setBottomLength] = useState(0);
  const [frontRise, setFrontRise] = useState(0);
  const [waist, setWaist] = useState(0);
  const [hipWidth, setHipWidth] = useState(0);
  const [thigh, setThigh] = useState(0);
  const [hemWidth, setHemWidth] = useState(0);
  const [isTailoringChecked, setIsTailoringChecked] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false); // 모달 상태 관리
  const [PordimgUri, setProdUri] = useState<string>(''); // 제품 페이지 uri 관리
  const [tryimgUri, settryimgUri] = useState<string>(''); // 입어보기 uri 관리
  const [productInfo, setProductInfo] = useState<{
    itemKey: number;
    itemName: string;
    itemBrand: string;
    itemType: string;
    itemStyle: string;
    itemPrice: number;
    itemContent: string;
    itemTopInfo: [
      {
        itemSize: string;
        itemHeight: number;
        itemShoulder: number;
        itemArm: number;
        itemChest: number;
        itemSleeve: number;
      },
    ];
    itemBottomInfo: any;
    itemImgNames: string;
    pitPrice: number;
  }>({
    itemKey: 0,
    itemName: '',
    itemBrand: '',
    itemType: '',
    itemStyle: '',
    itemPrice: 0,
    itemContent: '',
    itemTopInfo: [
      {
        itemSize: '',
        itemHeight: 0,
        itemShoulder: 0,
        itemArm: 0,
        itemChest: 0,
        itemSleeve: 0,
      },
    ],
    itemBottomInfo: null,
    itemImgNames: '',
    pitPrice: 0,
  });
  const { userHeight, userEmail } = useUser();
  const itemid = route.params.itemkey;

  const [userBodyInfo, setUserBodyInfo] = useState<{
    userHeight: number;
    userWeight: number;
    armSize: number;
    shoulderSize: number;
    bodySize: number;
    legSize: number;
  } | null>(null);

  const fetchUserBodyInfo = async () => {
    try {
      const res = await reqGet(
        path.join(DATA_URL, 'api', 'userbodyinfo', userEmail)
      );
      if (res) {
        setUserBodyInfo({
          userHeight: res.userHeight,
          userWeight: res.userWeight,
          armSize: res.armSize,
          shoulderSize: res.shoulderSize,
          bodySize: res.bodySize,
          legSize: res.legSize,
        });
      }
    } catch (error) {
      console.error('사용자 신체 정보 가져오기 오류:', error);
    }
  };

  const handleIncrementLength = () => setLength(length + 1);
  const handleDecrementLength = () => length > 0 && setLength(length - 1);
  const handleIncrementShoulder = () => setShoulder(shoulder + 1);
  const handleDecrementShoulder = () =>
    shoulder > 0 && setShoulder(shoulder - 1);
  const handleIncrementChest = () => setChest(chest + 1);
  const handleDecrementChest = () => chest > 0 && setChest(chest - 1);
  const handleIncrementSleeve = () => setSleeve(sleeve + 1);
  const handleDecrementSleeve = () => sleeve > 0 && setSleeve(sleeve - 1);

  // 하의 조정 버튼에 필요한 함수 추가
  const handleIncrementBottomLength = () => setBottomLength(bottomLength + 1);
  const handleDecrementBottomLength = () => bottomLength > 0 && setBottomLength(bottomLength - 1);

  const handleIncrementFrontRise = () => setFrontRise(frontRise + 1);
  const handleDecrementFrontRise = () => frontRise > 0 && setFrontRise(frontRise - 1);

  const handleIncrementWaist = () => setWaist(waist + 1);
  const handleDecrementWaist = () => waist > 0 && setWaist(waist - 1);

  const handleIncrementHipWidth = () => setHipWidth(hipWidth + 1);
  const handleDecrementHipWidth = () => hipWidth > 0 && setHipWidth(hipWidth - 1);

  const handleIncrementThigh = () => setThigh(thigh + 1);
  const handleDecrementThigh = () => thigh > 0 && setThigh(thigh - 1);

  const handleIncrementHemWidth = () => setHemWidth(hemWidth + 1);
  const handleDecrementHemWidth = () => hemWidth > 0 && setHemWidth(hemWidth - 1);

  const handleSizeSelect = (size: string, type: 'top' | 'bottom') => {
    if (isTailoringChecked) return;  // 수선하기 체크 시 선택 불가

    setSelectedSize(size);
    const selectedSizeData = type === 'top'
      ? productInfo.itemTopInfo.find((info: TopInfoType) => info.itemSize === size)
      : productInfo.itemBottomInfo?.find((info: BottomInfoType) => info.itemSize === size);
    setSizeData(selectedSizeData);
  };
  const [qty, setQty] = useState(1);

  // 수량
  const handleIncrementQty = () => setQty(qty + 1);
  const handleDecrementQty = () => qty > 1 && setQty(qty - 1);

  // 모달 열기
  const openModal = () => {
    setIsModalVisible(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setIsModalVisible(false);
  };

  const handleAddToCart = async () => {
    if (!selectedSize) {
      Alert.alert('사이즈를 선택해 주세요.');
      return;
    }

    // 수선 여부 및 수선 정보 구성
    const pitStatus = isTailoringChecked;
    const pitItemCart = pitStatus
      ? productInfo.itemType === '상의'
        ? {
          itemType: '상의',
          itemSize: selectedSize,
          itemHeight: length,
          itemShoulder: shoulder,
          itemChest: chest,
          itemSleeve: sleeve,
        }
        : {
          itemType: '하의',
          itemSize: selectedSize,
          itemHeight: bottomLength,
          frontRise: frontRise,
          itemWaists: waist,
          itemHipWidth: hipWidth,
          itemThighs: thigh,
          itemHemWidth: hemWidth,
        }
      : null;

    // 총 가격 계산: 수선 선택 시 수선 가격을 포함
    const totalItemPrice = pitStatus ? productInfo.itemPrice + productInfo.pitPrice : productInfo.itemPrice;

    const body = {
      itemKey: productInfo.itemKey,
      userEmail: userEmail,
      itemImgName: productInfo.itemImgNames,
      itemName: productInfo.itemName,
      itemSize: selectedSize,
      itemType: productInfo.itemType,
      itemPrice: totalItemPrice, // 총 가격을 요청 바디에 포함
      qty: qty,
      pitStatus,
      pitPrice: productInfo.pitPrice, // 제품 상세 API에서 가져온 수선 가격
      pitItemCart,
    };

    try {
      const res = await reqPost(
        path.join(DATA_URL, 'api', 'cart', 'store'),
        body
      );

      if (res.message === '장바구니에 상품이 성공적으로 추가되었습니다.') {
        Alert.alert('장바구니 담기 성공');
      } else {
        Alert.alert('장바구니 담기 실패. 다시 시도해 주세요.');
      }
    } catch (error) {
      console.error('장바구니에 추가하는 도중 오류가 발생했습니다:', error);
      Alert.alert('장바구니에 담는 도중 오류가 발생했습니다.');
    }
  };

  const handlePurchase = () => {
    if (!selectedSize) {
      Alert.alert('사이즈를 선택해 주세요.');
      return;
    }

    const data = [
      {
        itemKey: productInfo.itemKey,
        itemName: productInfo.itemName,
        itemSize: selectedSize,
        itemPrice: productInfo.itemPrice,
        qty: qty,
        pitStatus: isTailoringChecked,
        pitPrice: isTailoringChecked ? productInfo.pitPrice : 0,
        pitTopInfo: productInfo.itemType === '상의' && isTailoringChecked
          ? {
            itemHeight: length,
            itemShoulder: shoulder,
            itemChest: chest,
            itemSleeve: sleeve,
          }
          : null,
        pitBottomInfo: productInfo.itemType === '하의' && isTailoringChecked
          ? {
            itemHeight: bottomLength,
            frontrise: frontRise,
            itemWaists: waist,
            itemhipWidth: hipWidth,
            itemThighs: thigh,
            itemHemWidth: hemWidth,
          }
          : null,
      },
    ];

    navigation.navigate('Order', { data });
  };

  // 상품 정보 가져오기
  const fetchProductData = async () => {
    const productRes = await reqGet(path.join(DATA_URL, 'api', 'item-info', `${itemid}`));

    const processedBottomInfo = productRes.itemBottomInfo?.map((info: any) => ({
      ...info,
      frontRise: info.frontrise,
      itemHipWidth: info.itemhipWidth,
    }));

    setProductInfo({
      itemKey: productRes.itemKey,
      itemName: productRes.itemName,
      itemBrand: productRes.itemBrand,
      itemType: productRes.itemType,
      itemStyle: productRes.itemStyle,
      itemPrice: productRes.itemPrice,
      itemContent: productRes.itemContent,
      itemTopInfo: productRes.itemTopInfo,
      itemBottomInfo: processedBottomInfo || null,
      itemImgNames: productRes.itemImgName[0],
      pitPrice: productRes.pitPrice || 0, // pitPrice가 있으면 할당
    });

    setProdUri(
      path.join(DATA_URL, 'api', 'img', 'imgserve', 'itemimg', productRes.itemImgName[0])
    );
  };

  // 가상피팅 이미지 가져오기
  const handleSetimg = async (fileName: string) => {
    const formData = new FormData();

    if (!userEmail || !userHeight) {
      console.log('이메일, 유저키 없음');
      throw Error('이메일, 유저키 없음');
    }

    const reqfile = await reqGet(
      path.join(DATA_URL, 'api', 'userForm', userEmail),
    );

    formData.append('clothesImg', {
      uri: path.join(DATA_URL, 'api', 'img', 'imgserve', 'itemimg', fileName),
      name: fileName,
      type: 'image/jpeg',
    } as FormDataValue);

    formData.append('bodyFileName', reqfile.fileName);
    // TODO: 백엔드 서버 의류타입 확인 필요
    formData.append('category', '상의');

    const res = await ArRequest(path.join(AR_URL, 'try-on'), formData);
    if (!res.ok) {
      throw Error(JSON.stringify(await res.json()));
    }
    const blob = await res.blob();

    const fileReaderInstance = new FileReader();
    fileReaderInstance.readAsDataURL(blob);
    fileReaderInstance.onload = () => {
      const base64data = fileReaderInstance.result;
      settryimgUri(base64data as string);
    };
  };

  // 추천 사이즈 계산
  const calculateRecommendedSize = () => {
    if (!userBodyInfo || !productInfo) return;

    let bestFit: TopInfoType | BottomInfoType | null = null;
    let minDifference = Infinity;

    if (productInfo.itemTopInfo && productInfo.itemTopInfo.length > 0) {
      productInfo.itemTopInfo.forEach((item: TopInfoType) => {
        const heightDiff = Math.abs(item.itemHeight - userBodyInfo.bodySize);
        const shoulderDiff = Math.abs(item.itemShoulder - userBodyInfo.shoulderSize);
        const chestDiff = Math.abs(item.itemChest - userBodyInfo.armSize);
        const sleeveDiff = Math.abs(item.itemSleeve - userBodyInfo.armSize);

        const difference = heightDiff + shoulderDiff + chestDiff + sleeveDiff;
        if (difference < minDifference) {
          minDifference = difference;
          bestFit = item;
        }
      });

    } else if (productInfo.itemBottomInfo && productInfo.itemBottomInfo.length > 0) {
      productInfo.itemBottomInfo.forEach((item: BottomInfoType) => {
        const legDiff = Math.abs(item.itemHeight - userBodyInfo.legSize);
        if (legDiff < minDifference) {
          minDifference = legDiff;
          bestFit = item;
        }
      });
    }

    console.log("Calculated recommendedSize:", bestFit); // 추가된 디버그 출력
    setRecommendedSize(bestFit);
  };

  const handleSizeRecommendationForBottom = () => {
    if (!userBodyInfo || !productInfo?.itemBottomInfo) return;

    const nextLargerSize = productInfo.itemBottomInfo.find(
      (sizeInfo: BottomInfoType) => sizeInfo.itemHeight > userBodyInfo.legSize  // sizeInfo에 타입 추가
    );

    if (nextLargerSize) {
      setRecommendedSize(nextLargerSize);
      setSelectedSize(nextLargerSize.itemSize);
    } else {
      setRecommendedSize(productInfo.itemBottomInfo[productInfo.itemBottomInfo.length - 1]);
      setSelectedSize(productInfo.itemBottomInfo[productInfo.itemBottomInfo.length - 1].itemSize);
    }
  };

  useEffect(() => {
    fetchUserBodyInfo(); // 기존에 정의된 fetchUserBodyInfo 함수를 사용
    fetchProductData(); // 상품 데이터 가져오는 함수
  }, []);

  useEffect(() => {
    calculateRecommendedSize();
  }, [userBodyInfo, productInfo]);

  useEffect(() => {
    if (productInfo.itemImgNames && PordimgUri) {
      handleSetimg(productInfo.itemImgNames).catch(e => {
        console.log(`가상 피팅 오류: ${e}`);
        settryimgUri(PordimgUri);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productInfo.itemImgNames, PordimgUri]);

  // 사이즈 추천 함수: 상의
  const handleSizeRecommendationForTop = () => {
    if (!userBodyInfo || !productInfo?.itemTopInfo) return;

    let selectedSizeIndex = 0;
    productInfo.itemTopInfo.some((sizeInfo: TopInfoType, index: number) => {
      if (
        sizeInfo.itemHeight >= userBodyInfo.bodySize &&
        sizeInfo.itemShoulder >= userBodyInfo.shoulderSize &&
        sizeInfo.itemSleeve >= userBodyInfo.armSize
      ) {
        selectedSizeIndex = index;
        return true;
      }
      return false;
    });

    const finalSize = productInfo.itemTopInfo[selectedSizeIndex];
    setRecommendedSize(finalSize);
    setSelectedSize(finalSize.itemSize);
  };

  // 사이즈 데이터 설정 함수 (수선하기, 사용자가 임의로 선택한 경우 모두 대응)
  const updateSizeData = () => {
    if (productInfo.itemTopInfo && selectedSize) {
      const selectedSizeData = productInfo.itemTopInfo.find(
        (info: TopInfoType) => info.itemSize === selectedSize
      );
      setSizeData(selectedSizeData);
    } else if (productInfo.itemBottomInfo && selectedSize) {
      const selectedSizeData = productInfo.itemBottomInfo.find(
        (info: BottomInfoType) => info.itemSize === selectedSize
      );
      setSizeData(selectedSizeData);
    } else if (isTailoringChecked && recommendedSize) {
      setSizeData(recommendedSize);  // 수선하기 버튼이 눌린 상태일 경우 recommendedSize 사용
    } else {
      setSizeData(null);
    }
  };

  // 수선하기 체크 상태에 따라 상의/하의 추천 사이즈 계산 및 사이즈 데이터 업데이트
  useEffect(() => {
    if (isTailoringChecked) {
      if (productInfo.itemTopInfo) {
        handleSizeRecommendationForTop();
      } else if (productInfo.itemBottomInfo) {
        handleSizeRecommendationForBottom();
      }
    } else {
      setSelectedSize(null);  // 수선하기 버튼 해제 시 선택된 사이즈 초기화
      setSizeData(null);       // 관련 사이즈 데이터도 초기화
    }
  }, [isTailoringChecked]);

  useEffect(() => {
    updateSizeData();
  }, [selectedSize, productInfo, recommendedSize]);

  useEffect(() => {
    if (selectedSize && productInfo.itemTopInfo) {
      const selectedSizeData = productInfo.itemTopInfo.find(
        (info: any) => info.itemSize === selectedSize
      );
      setSizeData(selectedSizeData);
    }
  }, [selectedSize, productInfo.itemTopInfo]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.platformName}>{productInfo.itemBrand}</Text>
        <View style={styles.cartButtonWrapper}>
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => navigation.navigate('Cart')}>
            <Image
              source={require('../../assets/img/main/product/basket.png')}
              style={styles.cartImage}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* 제품 이미지 */}
      <View style={styles.roundedRect}>
        {PordimgUri ? (
          <Image source={{ uri: PordimgUri }} style={styles.productImage} />
        ) : (
          <></>
        )}
      </View>

      {/* 제품 설명 */}
      <Text style={styles.brandName}>{productInfo.itemBrand}</Text>
      <Text style={styles.productName}>{productInfo.itemName}</Text>
      <Text style={styles.price}>
        ₩{productInfo.itemPrice.toLocaleString()}
      </Text>
      <Text style={styles.description}>{productInfo.itemContent}</Text>

      {/* 사이즈 표 */}
      <View style={styles.sizeButtons}>
        {(Array.isArray(productInfo.itemTopInfo) ? productInfo.itemTopInfo : productInfo.itemBottomInfo || [])
          .sort((a: { itemSize: string }, b: { itemSize: string }) => {
            const order = ['S', 'M', 'L', 'XL', '2XL', '3XL', 'Free'];
            return order.indexOf(a.itemSize) - order.indexOf(b.itemSize);
          })
          .map((info: TopInfoType | BottomInfoType) => (
            <TouchableOpacity
              key={info.itemSize}
              style={[
                styles.sizeButton,
                selectedSize === info.itemSize && styles.selectedSizeButton,
              ]}
              onPress={() => handleSizeSelect(info.itemSize, productInfo.itemTopInfo ? 'top' : 'bottom')}
              disabled={isTailoringChecked}>
              <Text
                style={[
                  styles.sizeButtonText,
                  selectedSize === info.itemSize && styles.selectedSizeButtonText,
                ]}>
                {info.itemSize}
              </Text>
            </TouchableOpacity>
          ))}
      </View>

      {/* 사이즈 정보 표시 (수선하기가 체크된 경우와 사용자가 임의로 사이즈를 선택한 경우) */}
      {(isTailoringChecked || selectedSize) && sizeData && (
        <View style={styles.sizeChartContainer}>
          <View style={styles.sizeChartHeader}>
            {productInfo.itemTopInfo ? (
              ['Size', 'Height', 'Shoulder', 'Chest', 'Sleeve'].map((header, index) => (
                <Text key={index} style={styles.sizeChartHeaderText}>{header}</Text>
              ))
            ) : (
              ['Size', 'Height', 'Front Rise', 'Waist', 'Hip', 'Thigh', 'Hem Width'].map((header, index) => (
                <Text key={index} style={styles.sizeChartHeaderText}>{header}</Text>
              ))
            )}
          </View>
          <View style={styles.sizeChartRow}>
            <Text style={styles.sizeChartRowTitle}>{sizeData.itemSize}</Text>
            <Text style={styles.sizeChartRowText}>{sizeData.itemHeight}</Text>
            {productInfo.itemTopInfo ? (
              <>
                <Text style={styles.sizeChartRowText}>{sizeData.itemShoulder}</Text>
                <Text style={styles.sizeChartRowText}>{sizeData.itemChest}</Text>
                <Text style={styles.sizeChartRowText}>{sizeData.itemSleeve}</Text>
              </>
            ) : (
              <>
                <Text style={styles.sizeChartRowText}>{sizeData.frontRise}</Text>
                <Text style={styles.sizeChartRowText}>{sizeData.itemWaists}</Text>
                <Text style={styles.sizeChartRowText}>{sizeData.itemHipWidth}</Text>
                <Text style={styles.sizeChartRowText}>{sizeData.itemThighs}</Text>
                <Text style={styles.sizeChartRowText}>{sizeData.itemHemWidth}</Text>
              </>
            )}
          </View>
        </View>
      )}

      {/* 줄 */}
      <View style={styles.divider} />

      {/* 사이즈 추천 */}
      <View style={styles.customFitContainer}>
        <Text style={styles.customFitTitle}>체형에 맞는 사이즈 추천이에요</Text>
        <Text style={styles.originalSize}>원래 사이즈</Text>

        {/* 원래 사이즈 - 상의 */}
        {Array.isArray(productInfo.itemTopInfo) && productInfo.itemTopInfo[0] && userBodyInfo && (
          <View style={styles.sizeChartRow2}>
            <Text style={styles.sizeChartRowText}>상의</Text>
            <Text style={styles.sizeChartRowText}>{userBodyInfo.bodySize}</Text>
            <Text style={styles.sizeChartRowText}>{userBodyInfo.shoulderSize}</Text>
            <Text style={styles.sizeChartRowText}>{productInfo.itemTopInfo[0].itemChest}</Text>
            <Text style={styles.sizeChartRowText}>{userBodyInfo.armSize}</Text>
          </View>
        )}

        {/* 원래 사이즈 - 하의 */}
        {productInfo.itemBottomInfo && userBodyInfo && (
          <View style={styles.sizeChartRow2}>
            <Text style={styles.sizeChartRowText}>하의</Text>
            <Text style={styles.sizeChartRowText}>{userBodyInfo.legSize}</Text>
            <Text style={styles.sizeChartRowText}>{productInfo.itemBottomInfo[0].frontrise}</Text>
            <Text style={styles.sizeChartRowText}>{productInfo.itemBottomInfo[0].itemWaists}</Text>
            <Text style={styles.sizeChartRowText}>{productInfo.itemBottomInfo[0].itemhipWidth}</Text>
            <Text style={styles.sizeChartRowText}>{productInfo.itemBottomInfo[0].itemThighs}</Text>
            <Text style={styles.sizeChartRowText}>{productInfo.itemBottomInfo[0].itemHemWidth}</Text>
          </View>
        )}

        {recommendedSize && (
          <View style={styles.sizeChartContainer}>
            <Text style={styles.originalSize}>추천 사이즈</Text>
            <View style={styles.sizeChartRow}>
              <Text style={styles.sizeChartRowTitle}>{recommendedSize.itemSize}</Text>
              <Text style={styles.sizeChartRowText}>{recommendedSize.itemHeight}</Text>
              {productInfo.itemTopInfo ? (
                // 상의일 때 접근
                <>
                  <Text style={styles.sizeChartRowText}>{(recommendedSize as TopInfoType).itemShoulder}</Text>
                  <Text style={styles.sizeChartRowText}>{(recommendedSize as TopInfoType).itemChest}</Text>
                  <Text style={styles.sizeChartRowText}>{(recommendedSize as TopInfoType).itemSleeve}</Text>
                </>
              ) : (
                // 하의일 때 접근
                <>
                  <Text style={styles.sizeChartRowText}>{(recommendedSize as BottomInfoType).frontRise}</Text>
                  <Text style={styles.sizeChartRowText}>{(recommendedSize as BottomInfoType).itemWaists}</Text>
                  <Text style={styles.sizeChartRowText}>{(recommendedSize as BottomInfoType).itemHipWidth}</Text>
                  <Text style={styles.sizeChartRowText}>{(recommendedSize as BottomInfoType).itemThighs}</Text>
                  <Text style={styles.sizeChartRowText}>{(recommendedSize as BottomInfoType).itemHemWidth}</Text>
                </>
              )}
            </View>
          </View>
        )}
      </View>

      {/* 수선 */}
      <View style={styles.tailoringSection}>
        <View style={styles.checkboxContainer}>
          <Text style={styles.label}>수선하기</Text>
          <CheckBox
            value={isTailoringChecked}
            onValueChange={setIsTailoringChecked}
            tintColors={{ true: '#1A16FF', false: '#1A16FF' }}
            style={styles.checkbox}
          />
        </View>
        <Text style={styles.tryOnText}>입어보기</Text>
        {/* 수선 이미지 클릭 시 모달 */}
        <TouchableOpacity onPress={openModal}>
          <View style={styles.roundedRect}>
            {tryimgUri ? (
              <Image source={{ uri: tryimgUri }} style={styles.productImage} />
            ) : (
              <></>
            )}
          </View>
        </TouchableOpacity>

        {/* 모달 */}
        <Modal visible={isModalVisible} transparent={true}>
          <TouchableWithoutFeedback onPress={closeModal}>
            <View style={styles.modalBackground}>
              <View style={styles.modalContent}>
                {tryimgUri ? (
                  <Image
                    source={{ uri: tryimgUri }}
                    style={styles.modalImage}
                    resizeMode="contain"
                  />
                ) : (
                  <></>
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {isTailoringChecked && productInfo.itemTopInfo && (
          // 상의 조정 버튼
          <View>
            <View style={{ flexDirection: 'row' }}>
              <View style={styles.buttoncontainer}>
                <Text style={styles.buttontitle}>총장 :</Text>
                <View style={styles.buttoncontainer2}>
                  <TouchableOpacity onPress={handleDecrementLength} style={styles.button}>
                    <Text style={styles.buttonText}> - </Text>
                  </TouchableOpacity>
                  <Text style={styles.buttonText2}>{length}</Text>
                  <TouchableOpacity onPress={handleIncrementLength} style={styles.button}>
                    <Text style={styles.buttonText}> + </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.buttoncontainer, { marginLeft: '14%' }]}>
                <Text style={styles.buttontitle}>어깨 :</Text>
                <View style={styles.buttoncontainer2}>
                  <TouchableOpacity onPress={handleDecrementShoulder} style={styles.button}>
                    <Text style={styles.buttonText}> - </Text>
                  </TouchableOpacity>
                  <Text style={styles.buttonText2}>{shoulder}</Text>
                  <TouchableOpacity onPress={handleIncrementShoulder} style={styles.button}>
                    <Text style={styles.buttonText}> + </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={{ flexDirection: 'row' }}>
              <View style={styles.buttoncontainer}>
                <Text style={styles.buttontitle}>가슴 :</Text>
                <View style={styles.buttoncontainer2}>
                  <TouchableOpacity onPress={handleDecrementChest} style={styles.button}>
                    <Text style={styles.buttonText}> - </Text>
                  </TouchableOpacity>
                  <Text style={styles.buttonText2}>{chest}</Text>
                  <TouchableOpacity onPress={handleIncrementChest} style={styles.button}>
                    <Text style={styles.buttonText}> + </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.buttoncontainer, { marginLeft: '14%' }]}>
                <Text style={styles.buttontitle}>소매 :</Text>
                <View style={styles.buttoncontainer2}>
                  <TouchableOpacity onPress={handleDecrementSleeve} style={styles.button}>
                    <Text style={styles.buttonText}> - </Text>
                  </TouchableOpacity>
                  <Text style={styles.buttonText2}>{sleeve}</Text>
                  <TouchableOpacity onPress={handleIncrementSleeve} style={styles.button}>
                    <Text style={styles.buttonText}> + </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}

        {isTailoringChecked && productInfo.itemBottomInfo && (
          // 하의 조정 버튼
          <View>
            <View style={{ flexDirection: 'row' }}>
              <View style={styles.buttoncontainer}>
                <Text style={styles.buttontitle}>총장 :</Text>
                <View style={styles.buttoncontainer2}>
                  <TouchableOpacity onPress={handleDecrementBottomLength} style={styles.button}>
                    <Text style={styles.buttonText}> - </Text>
                  </TouchableOpacity>
                  <Text style={styles.buttonText2}>{bottomLength}</Text>
                  <TouchableOpacity onPress={handleIncrementBottomLength} style={styles.button}>
                    <Text style={styles.buttonText}> + </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.buttoncontainer, { marginLeft: '14%' }]}>
                <Text style={styles.buttontitle}>밑위 :</Text>
                <View style={styles.buttoncontainer2}>
                  <TouchableOpacity onPress={handleDecrementFrontRise} style={styles.button}>
                    <Text style={styles.buttonText}> - </Text>
                  </TouchableOpacity>
                  <Text style={styles.buttonText2}>{frontRise}</Text>
                  <TouchableOpacity onPress={handleIncrementFrontRise} style={styles.button}>
                    <Text style={styles.buttonText}> + </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={{ flexDirection: 'row' }}>
              <View style={styles.buttoncontainer}>
                <Text style={styles.buttontitle}>허리 :</Text>
                <View style={styles.buttoncontainer2}>
                  <TouchableOpacity onPress={handleDecrementWaist} style={styles.button}>
                    <Text style={styles.buttonText}> - </Text>
                  </TouchableOpacity>
                  <Text style={styles.buttonText2}>{waist}</Text>
                  <TouchableOpacity onPress={handleIncrementWaist} style={styles.button}>
                    <Text style={styles.buttonText}> + </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.buttoncontainer, { marginLeft: '14%' }]}>
                <Text style={styles.buttontitle}>엉덩이 :</Text>
                <View style={styles.buttoncontainer2}>
                  <TouchableOpacity onPress={handleDecrementHipWidth} style={styles.button}>
                    <Text style={styles.buttonText}> - </Text>
                  </TouchableOpacity>
                  <Text style={styles.buttonText2}>{hipWidth}</Text>
                  <TouchableOpacity onPress={handleIncrementHipWidth} style={styles.button}>
                    <Text style={styles.buttonText}> + </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={{ flexDirection: 'row' }}>
              <View style={styles.buttoncontainer}>
                <Text style={styles.buttontitle}>허벅지 :</Text>
                <View style={styles.buttoncontainer2}>
                  <TouchableOpacity onPress={handleDecrementThigh} style={styles.button}>
                    <Text style={styles.buttonText}> - </Text>
                  </TouchableOpacity>
                  <Text style={styles.buttonText2}>{thigh}</Text>
                  <TouchableOpacity onPress={handleIncrementThigh} style={styles.button}>
                    <Text style={styles.buttonText}> + </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.buttoncontainer, { marginLeft: '14%' }]}>
                <Text style={styles.buttontitle}>밑단 :</Text>
                <View style={styles.buttoncontainer2}>
                  <TouchableOpacity onPress={handleDecrementHemWidth} style={styles.button}>
                    <Text style={styles.buttonText}> - </Text>
                  </TouchableOpacity>
                  <Text style={styles.buttonText2}>{hemWidth}</Text>
                  <TouchableOpacity onPress={handleIncrementHemWidth} style={styles.button}>
                    <Text style={styles.buttonText}> + </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}
      </View>

      <View style={styles.quantityContainer}>
        <Text style={styles.quantityLabel}>수량:</Text>
        <View style={styles.quantityControls}>
          <TouchableOpacity
            onPress={handleDecrementQty}
            style={styles.quantityButton}>
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantityText}>{qty}</Text>
          <TouchableOpacity
            onPress={handleIncrementQty}
            style={styles.quantityButton}>
            <Text style={styles.quantityButtonText2}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isTailoringChecked && (
        <View style={styles.pitPriceContainer}>
          <Text style={styles.pitPriceText}>수선 가격: ₩{productInfo.pitPrice.toLocaleString()}</Text>
        </View>
      )}

      {/* 아래 버튼 */}
      <View style={styles.bottomSection}>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.cartButtonBottom}
            onPress={handleAddToCart}>
            <Text style={styles.cartButtonText}>장바구니 담기</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buyButton} onPress={handlePurchase}>
            <Text style={styles.buyButtonText}>바로 구매</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingHorizontal: '6%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  imageWrapper: {
    width: '100%',
  },
  productImage: {
    width: '70%',
    height: 250,
  },
  brandName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#A2A2A2',
    marginTop: '3%',
  },
  productName: {
    fontSize: 20,
    color: '#000',
    marginVertical: '2%',
    fontWeight: 'bold',
  },
  price: {
    fontSize: 16,
    marginVertical: '0.7%',
    color: '#1A16FF',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginVertical: '2%',
  },
  sizeContainer: {
    marginVertical: '2%',
  },
  sizeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: '3%',
    color: '#000',
  },
  sizeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sizeButton: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: '2%',
    flex: 1,
    marginHorizontal: '0.8%',
  },
  sizeButtonText: {
    fontSize: 14,
    textAlign: 'center',
  },
  sampleImage: {
    width: '105%',
    height: 200,
    marginVertical: '2%',
    right: '2%',
  },
  divider: {
    height: 1,
    backgroundColor: '#C5C5C5',
    marginVertical: '4%',
  },
  customFitTitle: {
    fontSize: 20,
    color: '#000',
    fontWeight: 'bold',
    marginVertical: '1%',
  },
  originalSize: {
    fontSize: 14,
    color: '#000',
    marginVertical: '2.5%',
    marginRight: '72%',
  },
  sizeChart: {
    width: '100%',
    height: 20,
    marginVertical: '2%',
  },
  tailoringSection: {
    marginVertical: '1%',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '1%',
  },
  checkbox: {
    marginRight: 8,
  },
  label: {
    fontSize: 20,
    color: '#000',
    fontWeight: 'bold',
  },
  tryOnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    left: '2%',
    marginTop: '3%',
  },
  roundedRect: {
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#F4F4F4',
    padding: '2%',
    alignItems: 'center',
    marginTop: '5%',
    height: 260,
  },
  innerImage: {
    width: '50%',
    height: 250,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // 반투명 배경
  },
  modalContent: {
    width: '90%',
    height: '70%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  buttoncontainer: {
    top: '30%',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: '2%',
    width: '40%',
  },
  buttontitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttontitle: {
    color: '#000',
    fontSize: 19,
    fontWeight: 'bold',
    marginRight: '15%',
  },
  buttoncontainer2: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#000',
    paddingVertical: '1%',
    paddingHorizontal: '3%',
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: '1%',
    paddingHorizontal: '3%',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#fff',
  },
  buttonText: {
    color: '#000',
    fontSize: 20,
    textAlign: 'center',
  },
  buttonText2: {
    color: '#000',
    fontSize: 20,
    marginHorizontal: '3%',
  },
  bottomSection: {
    alignItems: 'center',
    marginVertical: '8%',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  customButton: {
    flex: 1,
    padding: '2.5%',
    borderRadius: 5,
    backgroundColor: '#fff',
    alignItems: 'center',
    width: '100%',
    top: '17%',
    borderWidth: 1.5,
    borderColor: '#000',
    marginBottom: '4%',
  },
  customButtonText: {
    color: '#000',
    fontSize: 19,
    fontWeight: 'bold',
  },
  cartButtonBottom: {
    flex: 1,
    marginRight: '2%',
    padding: '4%',
    borderRadius: 10,
    backgroundColor: '#000',
    alignItems: 'center',
  },
  buyButton: {
    flex: 1,
    marginLeft: '2%',
    padding: '4%',
    borderRadius: 10,
    backgroundColor: '#000',
    alignItems: 'center',
  },
  cartButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  selectedSizeButton: {
    backgroundColor: '#000',
  },
  selectedSizeButtonText: {
    color: '#fff',
  },
  sizeChartContainer: {
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeChartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#000',
  },
  sizeChartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    paddingVertical: 10,
    backgroundColor: '#f2f2f2',
  },
  sizeChartHeaderText: {
    fontSize: 13,
    textAlign: 'center',
    flex: 1, // 각 셀의 크기 동일하게
    minWidth: 50, // 최소 너비 설정
  },
  sizeChartRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  sizeChartRowTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1, // 각 셀이 동일한 크기를 가지도록 설정
    minWidth: 50, // 최소 너비를 설정하여 두 글자 이상도 잘 맞도록
  },
  sizeChartRowText: {
    textAlign: 'center',
    flex: 1, // 각 셀이 동일한 크기를 가지도록 설정
    minWidth: 50, // 최소 너비 설정
  },
  customFitContainer: {
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeChartRow2: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    paddingVertical: 10,
  },
  sizeChartCell: {
    flex: 1,
    textAlign: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  quantityLabel: {
    fontSize: 18,
    color: '#000',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    padding: 5,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  quantityText: {
    width: 30,
    textAlign: 'center',
    fontSize: 20,
    color: '#000',
  },
  quantityButtonText: {
    fontSize: 20,
    color: '#000',
  },
  quantityButtonText2: {
    fontSize: 20,
    color: '#000',
  },
  pitPriceContainer: {
    marginVertical: 10,
    padding: 10,
    alignItems: 'flex-end',
  },
  pitPriceText: {
    fontSize: 18,
    color: '#787878',
    textAlign: 'right',
  },
});

export default ProductPage;