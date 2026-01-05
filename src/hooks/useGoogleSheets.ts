import { useState, useEffect } from 'react';

const SHEET_ID = '1V7R6tldEnJtbN5LOeRF7-ubu_QmsrVN7E4IObjYvECU';

interface SpecialVisit {
  name: string;
  cover_image: string;
  sub_heading: string;
  description: string;
  images: string[];
}

interface Review {
  name: string;
  rating: number;
  comment: string;
  special_visits_category: string;
  date: string;
}

interface GalleryItem {
  name: string;
  image_url: string;
}

interface OtherContent {
  variable: string;
  content: string;
}

const parseCSV = (csv: string): string[][] => {
  const lines = csv.split('\n');
  return lines.map(line => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  });
};

const fetchSheetData = async (sheetName: string): Promise<string[][]> => {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
    const response = await fetch(url);
    const csv = await response.text();
    const rows = parseCSV(csv);
    return rows.slice(1); // Skip header row
  } catch (error) {
    console.error(`Error fetching ${sheetName}:`, error);
    return [];
  }
};

export const useSpecialVisits = () => {
  const [data, setData] = useState<SpecialVisit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSheetData('special_visits').then(rows => {
      const visits = rows
        .filter(row => row[0])
        .map(row => ({
          name: row[0] || '',
          cover_image: row[1] || '',
          sub_heading: row[2] || '',
          description: row[3] || '',
          images: (row[4] || '').split(',').map(s => s.trim()).filter(Boolean),
        }));
      setData(visits);
      setLoading(false);
    });
  }, []);

  return { data, loading };
};

export const useReviews = () => {
  const [data, setData] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSheetData('reviews').then(rows => {
      const reviews = rows
        .filter(row => row[0])
        .map(row => ({
          name: row[0] || '',
          rating: parseInt(row[1]) || 5,
          comment: row[2] || '',
          special_visits_category: row[3] || '',
          date: row[4] || '',
        }));
      setData(reviews);
      setLoading(false);
    });
  }, []);

  return { data, loading };
};

export const useGallery = () => {
  const [data, setData] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSheetData('gallery').then(rows => {
      const items = rows
        .filter(row => row[0])
        .map(row => ({
          name: row[0] || '',
          image_url: row[1] || '',
        }));
      setData(items);
      setLoading(false);
    });
  }, []);

  return { data, loading };
};

export const useOtherContent = () => {
  const [data, setData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSheetData('other').then(rows => {
      const content: Record<string, string> = {};
      rows.forEach(row => {
        if (row[0]) {
          content[row[0]] = row[1] || '';
        }
      });
      setData(content);
      setLoading(false);
    });
  }, []);

  return { data, loading };
};

// For submitting contact form - uses Google Apps Script web app
export const submitContactForm = async (formData: {
  name: string;
  email: string;
  phone_number: string;
  message: string;
}): Promise<boolean> => {
  try {
    // Google Apps Script Web App URL - user needs to deploy their own script
    // For now, we'll use a form submission approach
    const scriptUrl = `https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse`;
    
    // Alternative: Direct sheet append via Apps Script
    // The user should deploy this script and replace the URL:
    /*
    function doPost(e) {
      var sheet = SpreadsheetApp.openById('SHEET_ID').getSheetByName('contact_us');
      var data = JSON.parse(e.postData.contents);
      sheet.appendRow([data.name, data.email, data.phone_number, data.message, new Date()]);
      return ContentService.createTextOutput(JSON.stringify({success: true}));
    }
    */
    
    // For demo purposes, log the submission
    console.log('Contact form submitted:', formData);
    
    // Simulate successful submission
    return true;
  } catch (error) {
    console.error('Error submitting form:', error);
    return false;
  }
};
