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
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = () => {
    setLoading(true);
    setRefreshKey(prev => prev + 1);
  };

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
  }, [refreshKey]);

  return { data, loading, refetch };
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
    const fetchData = async () => {
      try {
        const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=other`;
        const response = await fetch(url);
        const csv = await response.text();
        const rows = parseCSV(csv);
        
        const content: Record<string, string> = {};
        
        // Check if first row is the header with variable names
        if (rows.length >= 1) {
          const headerRow = rows[0];
          const dataRow = rows.length > 1 ? rows[1] : [];
          
          // If header contains multiple space-separated variable names in first cell, parse them
          if (headerRow[0] && headerRow[0].includes(' ')) {
            const variableNames = headerRow[0].split(' ').filter(Boolean);
            const contentValues = headerRow[1] ? headerRow[1].split(' ') : [];
            
            // Map hero variables from header - handle hero_background_images specially
            variableNames.forEach((varName, index) => {
              if (varName === 'hero_background_images') {
                // Everything from this index onwards is the images (comma-separated URLs)
                const imagesStartIndex = headerRow[1]?.indexOf('https://');
                if (imagesStartIndex !== undefined && imagesStartIndex >= 0) {
                  content[varName] = headerRow[1].substring(imagesStartIndex);
                }
              } else if (varName === 'hero_title') {
                // First word after "content" is hero_title
                content[varName] = contentValues[1] || '';
              } else if (varName === 'hero_subtitle' || varName === 'hero_description') {
                // These are empty in the merged format
                content[varName] = '';
              }
            });
          } else {
            // Normal row format: variable in col 0, content in col 1
            if (headerRow[0] && headerRow[0] !== 'variable') {
              content[headerRow[0]] = headerRow[1] || '';
            }
          }
          
          // Process remaining rows normally (skip if first row was header)
          const dataRows = rows[0][0] === 'variable' || rows[0][0]?.includes(' ') ? rows.slice(1) : rows;
          dataRows.forEach(row => {
            if (row[0] && !row[0].includes(' ')) {
              content[row[0]] = row[1] || '';
            }
          });
        }
        
        console.log('Parsed other content:', content);
        setData(content);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching other content:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return { data, loading };
};

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwWUdWcAWMrQznpib9F5lVjJQW0Fbh6We4kwDVVO27F4WBFCoIXiG1BzYbF-QSjPWI/exec';

export const submitContactForm = async (formData: {
  name: string;
  email: string;
  phone_number: string;
  message: string;
}): Promise<boolean> => {
  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        type: 'contact_us'
      })
    });
    const result = await response.json();
    console.log("Contact form response:", result);
    if (!response.ok || result.status !== "success") {
      console.error("Contact form failed:", result);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return false;
  }
};

// For submitting reviews - uses Google Apps Script web app
export const submitReview = async (formData: {
  name: string;
  rating: number;
  comment: string;
  special_visits_category: string;
}): Promise<boolean> => {
  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        type: 'review'
      })
    });
    const result = await response.json();
    console.log("Review response:", result);
    if (!response.ok || result.status !== "success") {
      console.error("Review failed:", result);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error submitting review:', error);
    return false;
  }
};
