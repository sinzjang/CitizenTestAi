// 디버깅을 위한 간단한 테스트 스크립트
import LocationManager from './utils/locationManager.js';

async function testZipCode() {
  console.log('=== 11361 ZIP 코드 테스트 시작 ===');
  
  try {
    // 1. getRepresentativeFromZip 테스트
    console.log('\n1. getRepresentativeFromZip 테스트:');
    const repInfo = await LocationManager.getRepresentativeFromZip('11361');
    console.log('결과:', JSON.stringify(repInfo, null, 2));
    
    // 2. setLocationFromZipCode 테스트
    console.log('\n2. setLocationFromZipCode 테스트:');
    const locationResult = await LocationManager.setLocationFromZipCode('11361', 'NY');
    console.log('결과:', JSON.stringify(locationResult, null, 2));
    
  } catch (error) {
    console.error('에러 발생:', error);
    console.error('스택:', error.stack);
  }
}

// 테스트 실행
testZipCode();
