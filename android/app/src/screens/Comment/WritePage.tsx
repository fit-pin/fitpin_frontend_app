import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  FlatList,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../../../../../App';
import { useUser } from '../UserContext';
import { reqGet } from '../../utills/Request';
import path from 'path';
import { DATA_URL } from '../../Constant';

type WritePageRouteProp = RouteProp<RootStackParamList, 'WritePage'>;
type WritePageNavigationProp = StackNavigationProp<
  RootStackParamList,
  'WritePage'
>;

const WritePage: React.FC = () => {
  const navigation = useNavigation<WritePageNavigationProp>();
  const route = useRoute<WritePageRouteProp>();
  const { userEmail } = useUser();

  // 라우트에서 넘어온 이미지 URI를 가져옴
  const passedImageUri = route.params?.selectedImageUri || null;

  const [selectedCategory, setSelectedCategory] = useState<string>('상의');
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedFit, setSelectedFit] = useState<string | null>(null);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(passedImageUri); // 라우트에서 넘어온 이미지 자동 설정
  const [brandName, setBrandName] = useState<string>('');
  const [productName, setProductName] = useState<string>('');
  const [reviewText, setReviewText] = useState<string>('');
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  // 핏 보관함에서 이미지 가져오기
  const fetchImagesFromBackend = async () => {
    setIsLoading(true);
    try {
      const response = reqGet(
        path.join(DATA_URL, 'api', 'fitStorageImages', 'user', userEmail),
      );

      const data = await response;

      if (Array.isArray(data)) {
        const imageUrls = data.map(item =>
          path.join(
            DATA_URL,
            'api',
            'img',
            'imgserve',
            'fitstorageimg',
            item.fitStorageImg,
          ),
        );
        setImages(imageUrls.reverse());
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      Alert.alert('Error', 'Failed to fetch images.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImagesFromBackend();
  }, [userEmail]);

  // 이미지 업로드 및 코멘트 저장
// 이미지 업로드 및 코멘트 저장
const handleSubmit = async () => {
  if (!selectedImageUri) {
    Alert.alert('이미지를 선택해주세요.');
    return;
  }

  if (!productName) {
    Alert.alert('제품명을 입력해주세요.');
    return;
  }

  if (!reviewText) {
    Alert.alert('코멘트를 작성해주세요.');
    return;
  }

  let imageName = selectedImageUri.split('/').pop(); // 기본적으로 선택한 이미지 이름 사용

  try {
    // 1. 이미지가 이미 서버에 있는지 확인
    const checkResponse = await fetch(
      `http://fitpitback.kro.kr:8080/api/img/imgserve/fitstorageimg/${imageName}`
    );

    if (checkResponse.status === 404) {
      // 서버에 이미지가 없으면 업로드 진행
      const formData = new FormData();
      formData.append('userEmail', userEmail);
      formData.append('image', {
        uri: selectedImageUri,
        type: 'image/jpeg',
        name: imageName,
      });

      const uploadResponse = await fetch(
        'http://fitpitback.kro.kr:8080/api/fitStorageImages/upload',
        {
          method: 'POST',
          body: formData,
        }
      );

      const uploadResult = await uploadResponse.json();

      if (uploadResponse.ok) {
        imageName = uploadResult.message.split(': ')[1]; // 업로드 성공 시 반환된 이미지 이름 사용
      } else {
        Alert.alert('이미지 업로드 실패', uploadResult.message);
        return;
      }
    } else if (checkResponse.ok) {
      console.log('이미지가 이미 존재합니다. 중복 업로드를 방지합니다.');
    }

    // 2. 코멘트 저장
    const commentData = {
      userEmail: userEmail,
      fitStorageImg: imageName, // 서버에서 반환된 이미지 이름 사용
      fitComment: reviewText,
      itemType: selectedCategory,
      itemBrand: brandName,
      itemSize: selectedSize,
      option: selectedFit,
      itemName: productName, // **제품명 추가**
    };

    const commentResponse = await fetch(
      'http://fitpitback.kro.kr:8080/api/fit_comment/save_comment',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commentData),
      }
    );

    const commentResult = await commentResponse.json();

    if (commentResponse.ok) {
      Alert.alert('코멘트가 성공적으로 저장되었습니다.', `제품명: ${productName}`);
      navigation.navigate('Comment');
    } else {
      Alert.alert('코멘트 저장 실패', commentResult.message);
    }
  } catch (error) {
    if (error instanceof Error) {
      Alert.alert('처리 중 오류가 발생했습니다.', error.message);
    }
  }
};

  const openImageSelector = () => {
    setIsModalVisible(true);
  };

  const selectImage = (imageUri: string) => {
    setSelectedImageUri(imageUri);
    setIsModalVisible(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        <TouchableOpacity
          onPress={openImageSelector}
          style={styles.imageTouchArea}>
          {selectedImageUri ? (
            <Image
              source={{ uri: selectedImageUri }}
              style={styles.selectedImage}
            />
          ) : (
            <View style={styles.selectImageButton}>
              <Image
                source={require('../../assets/img/write/camera.png')}
                style={styles.cameraIcon}
              />
              <Image
                source={require('../../assets/img/write/add.png')}
                style={styles.plusIcon}
              />
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>카테고리</Text>
        <RNPickerSelect
          onValueChange={value => setSelectedCategory(value)}
          items={[
            { label: '반팔', value: '반팔' },
            { label: '긴팔', value: '긴팔' },
            { label: '반팔 아우터', value: '반팔 아우터' },
            { label: '긴팔 아우터', value: '긴팔 아우터' },
            { label: '조끼', value: '조끼' },
            { label: '슬링', value: '슬링' },
            { label: '반바지', value: '반바지' },
            { label: '긴바지', value: '긴바지' },
            { label: '치마', value: '치마' },
            { label: '반팔 원피스', value: '반팔 원피스' },
            { label: '긴팔 원피스', value: '긴팔 원피스' },
            { label: '조끼 원피스', value: '조끼 원피스' },
            { label: '슬링 원피스', value: '슬링 원피스' },
          ]}
          placeholder={{
            label: '카테고리를 선택하세요',
            value: null,
          }}
          value={selectedCategory}
        />
      </View>

      <View style={styles.line} />

      <View style={styles.inputContainer}>
        <Text style={styles.label}>브랜드명</Text>
        <TextInput
          placeholder="브랜드 이름을 적어주세요📝"
          placeholderTextColor="#999"
          style={styles.input}
          value={brandName}
          onChangeText={setBrandName}
        />
      </View>

      <View style={styles.line} />

      <View style={styles.inputContainer}>
        <Text style={styles.label}>제품명</Text>
        <TextInput
          placeholder="제품명을 적어주세요📝"
          placeholderTextColor="#999"
          style={styles.input}
          value={productName}
          onChangeText={setProductName}
        />
      </View>

      <View style={styles.line} />

      <View style={styles.sizeContainer}>
        <Text style={styles.sizeTitle}>사이즈 선택</Text>
        <View style={styles.sizeButtons}>
          {['S', 'M', 'L', 'XL', 'XXL', 'Free'].map(size => (
            <TouchableOpacity
              key={size}
              style={[
                styles.sizeButton,
                selectedSize === size && styles.selectedSizeButton,
              ]}
              onPress={() => setSelectedSize(size)}>
              <Text
                style={[
                  styles.sizeButtonText,
                  selectedSize === size && styles.selectedSizeButtonText,
                ]}>
                {size}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.line} />

      <Text style={styles.selectOptionText}>핏 선택</Text>

      <View style={styles.fitOptions}>
        {['약간 작다', '딱 맞는다', '약간 크다'].map((fit, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.fitButton,
              selectedFit === fit && styles.selectedFitButton,
            ]}
            onPress={() => setSelectedFit(fit)}>
            <Text
              style={[
                styles.fitButtonText,
                selectedFit === fit && styles.selectedFitButtonText,
              ]}>
              {fit}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.line} />

      <Text style={styles.reviewText}>한줄평</Text>
      <TextInput
        placeholder="한줄평을 적어주세요"
        placeholderTextColor="#999"
        style={styles.reviewInput}
        value={reviewText}
        onChangeText={setReviewText}
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>후기 올리기</Text>
      </TouchableOpacity>

      {/* 이미지 선택 모달 */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {isLoading ? (
              <ActivityIndicator size="large" color="#000" />
            ) : (
              <FlatList
                data={images}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => selectImage(item)}
                    style={styles.modalImageContainer}>
                    <Image source={{ uri: item }} style={styles.modalImage} />
                  </TouchableOpacity>
                )}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-between' }} // 두 개씩 보이도록 행 스타일 적용
              />
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsModalVisible(false)}>
              <Text style={styles.closeButtonText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const screenHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: '6%',
    backgroundColor: '#fff',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 16,
  },
  imageTouchArea: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  selectImageButton: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  cameraIcon: {
    width: 50,
    height: 50,
  },
  plusIcon: {
    width: 30,
    height: 30,
    position: 'absolute',
    right: 10,
    bottom: 10,
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  inputContainer: {
    marginBottom: '3%',
  },
  label: {
    fontSize: 16,
    marginBottom: '1%',
    color: '#000',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 8,
    fontSize: 16,
    color: '#000',
    marginTop: '2%',
  },
  line: {
    height: 1,
    backgroundColor: '#E9E9E9',
    marginVertical: '2%',
    marginBottom: '3%',
  },
  sizeContainer: {
    marginBottom: '2%',
  },
  sizeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000',
  },
  sizeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sizeButton: {
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
    flexBasis: '30%',
    alignItems: 'center',
  },
  selectedSizeButton: {
    backgroundColor: '#000',
  },
  sizeButtonText: {
    fontSize: 15,
    textAlign: 'center',
    color: '#000',
  },
  selectedSizeButtonText: {
    color: '#fff',
  },
  selectOptionText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000',
  },
  fitOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fitButton: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
    flexBasis: '30%',
    alignItems: 'center',
  },
  selectedFitButton: {
    backgroundColor: '#000',
  },
  fitButtonText: {
    fontSize: 14,
    color: '#000',
    textAlign: 'center',
  },
  selectedFitButtonText: {
    color: '#fff',
  },
  reviewText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000',
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 8,
    height: 100,
    fontSize: 16,
    color: '#000',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#000',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: '4%',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: '95%',
    height: screenHeight * 0.9,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
  },
  modalImageContainer: {
    flex: 1,
    margin: 5,
    maxWidth: '48%',
  },
  modalImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
  },
  closeButton: {
    backgroundColor: '#000',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default WritePage;