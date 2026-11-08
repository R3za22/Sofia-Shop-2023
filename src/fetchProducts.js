import { allProductsUrl } from './utils.js';

const data = [
  {
      "id": "1",
      "fields": {
          "company": "شمع",
          "colors": [
              "red",
              "yellow",
              "green",
              "purple",
              "blue"
          ],
          "featured": true,
          "price": 26000,
          "name": "شمع گوش",
          "image": [
              {
                "id": "1",
                "url": "./images/ta/1.svg", 
              }
          ],
          "description": `   🌸شمع پاکسازی گوش

          🌸خارج کردن جرم گوش و باکتری ها از مجرای گوش
          
          🌸بهبود شنوایی یا کاهش کم شنوایی
          
          🌸بهبود سردرد،میگرن،و سرماخوردگی
          
          🌸کم کردن وز وز گوش و خارش گوش
          
          🌸حس ارامش و کاملا بهداشتی  `
         
      }
  },
  {
    "id": "2",
    "fields": {
        "company": "هدبند",
        "colors": [
            "purple"
        ],
        "featured": true,
        "price": 42000,
        "name": "هدبند فانتزی گوشدار",
        "image": [
            {
                "id": "2",
                "url": "./images/ta/2.svg",

            }
        ],
        "description": ` 
        🌸مناسب هنگام ماسک زدن،ارایش کردن،شست وشوی صورت،انجام روتین روزانه پوستی و باعث جمع شدن موها از روی صورت میشود
        
        🌸جنس حوله ای و نرم
        
        🌸کش میاد و برای هر سایزی مناسبه
        
        
        🌸به عنوان تل هم میشه استفاده کرد
        
        
        🌸رنگ بندی جذاب و شیک `
    }
},
{
  "id": "3",
  "fields": {
      "company": "فوم",
      "colors": [
          "white",
        
      ],
      "featured": true,
      "price": 65000,
      "name": "فوم شست وشو شیر بز",
      "image": [
          {
            "id": "3",
            "url": "./images/ta/3.svg"

          }
      ],
      "description": `   
      🌸پاک کننده عمیق پوست
      
      🌸روشن کننده و ضد لک
      
      🌸ابرسان و کوچیک کردن منافذ پوست
      
      🌸حاوی لاکتیک اسید ولایه بردار ملایم
      
      🌸ضد میکروب و ضد آکنه
      
      🌸مغذی و تقویت کننده پوست
      
      🌸حجم 100 گرم انقضا 3 سال
      
      🌸کیفیت بالا  و صدرصد اورجینال  `
  }
},
{
  "id": "4",
  "fields": {
      "company": "سوهان",
      "colors": [
          "purple"
      ],
      "featured": false,
      "price": 27000,
      "name": "رنده و سوهان پا",
      "image": [
          {
            "id": "4",
            "url": "./images/ta/4.svg"
          }
      ],
      "description": `  🌸ازبین برنده پوست های زائد و مرده کف پا

      🌸رفع ترک پا
      
      🌸پاکسازی و شفافیت پوست
      
      🌸صاف کننده و یکدست کننده  پوست پا
      
      🌸جنس دسته پلاستیکی   `
  }
},
{
  "id": "5",
  "fields": {
      "company": "ماسک",
      "colors": [
          "white"
      ],
      "featured": false,
      "price": 28000,
      "name": "ماسک صورت انار رینوزیت",
      "image": [
          {
            "id": "5",
            "url": "./images/ta/5.svg",
          }
      ],
      "description": `   🌸ضد جوش و اکنه

      🌸روشن کننده قوی وسفت کننده پوست
      
      🌸حذف آلودگی پوستی و لایه مرده
      
      🌸شاداب کننده و کیفیت بالا
      
      🌸حجم 100 میل بزرگ و به صرفه
      
      🌸انقضا 2 سال  قیمت عالی
      
      🌸اورجینال و بارکد اصالت کالا  `
  }
},
{
  "id": "6",
  "fields": {
      "company": "ماسک",
      "colors": [
          "blue"
      ],
      "featured": false,
      "price": 29000,
      "name": "فرمژه مکس فاکتور",
      "image": [
          {
            "id": "6",
            "url": "./images/ta/6.svg",
          }
      ],
      "description": ` 
      🌸مناسب فرم دادن به مژه ها
      
      🌸دارای محافظ لاستیک دسته
      
      🌸جنس استیل با کیفیت بالا
      
      🌸دسته و سایز استاندار
      
       `
  }
}
]



const fetchProducts = async () => {
  const response = await fetch(allProductsUrl).catch((err) => console.log(err));
  if (response) {
    // return response.json();
    return data;
  }
  return response;
};

export default fetchProducts;
