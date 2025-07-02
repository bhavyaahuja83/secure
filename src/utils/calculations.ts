
export const calculateGST = (amount: number, isIGST: boolean = false) => {
  const gstRate = 0.18; // 18% GST
  const totalGST = amount * gstRate;
  
  if (isIGST) {
    return {
      cgst: 0,
      sgst: 0,
      igst: totalGST
    };
  } else {
    return {
      cgst: totalGST / 2,
      sgst: totalGST / 2,
      igst: 0
    };
  }
};

export const convertToWords = (amount: number): string => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if (amount === 0) return 'Zero';

  const convert = (num: number): string => {
    if (num === 0) return '';
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
    if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + convert(num % 100) : '');
    return '';
  };

  const crores = Math.floor(amount / 10000000);
  const lakhs = Math.floor((amount % 10000000) / 100000);
  const thousandsValue = Math.floor((amount % 100000) / 1000);
  const hundreds = amount % 1000;

  let result = '';
  if (crores) result += convert(crores) + ' Crore ';
  if (lakhs) result += convert(lakhs) + ' Lakh ';
  if (thousandsValue) result += convert(thousandsValue) + ' Thousand ';
  if (hundreds) result += convert(hundreds);

  return result.trim() + ' Only';
};

export const generateBillNumber = (): string => {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${year.toString().slice(-2)}-${month}/${random}`;
};
