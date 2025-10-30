export function mappingDataMedicineProcessExaminationPage(item) {
  return {
   id: item.id, 
   name: item.medicineName,
    label: item.medicineName, 
   category: item.category,
    unit: item.unit,
    quantityInStock: item.quantityInStock,
     priceSell: item.priceSell,
    expiryDate: item.expiryDate ,
  };
}