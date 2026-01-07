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

export interface OtherContentData {
  hero_titles: string[];
  hero_subtitles: string[];
  hero_descriptions: string[];
  hero_background_images: string[];
  in_mobile_max_special_visits: number;
  in_desktop_max_special_visits: number;
  in_mobile_max_gallery: number;
  in_desktop_max_gallery: number;
  in_mobile_max_reviews: number;
  in_desktop_max_reviews: number;
}

export const useOtherContent = () => {
  const [data, setData] = useState<OtherContentData>({
    hero_titles: [],
    hero_subtitles: [],
    hero_descriptions: [],
    hero_background_images: [],
    in_mobile_max_special_visits: 5,
    in_desktop_max_special_visits: 6,
    in_mobile_max_gallery: 5,
    in_desktop_max_gallery: 5,
    in_mobile_max_reviews: 5,
    in_desktop_max_reviews: 5,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=other`;
        const response = await fetch(url);
        const csv = await response.text();
        const rows = parseCSV(csv);
        
        const content: Record<string, string> = {};
        
        // Process rows - each row has: column A = variable name, column B = content
        rows.forEach((row) => {
          let variableName = row[0]?.trim() || '';
          let variableContent = row[1]?.trim() || '';

          // Support the user entering: "hero_title | Welcome to Sri Lanka" in ONE cell
          if (variableName.includes('|') && !variableContent) {
            const [left, right] = variableName.split('|').map(s => s.trim());
            variableName = left || '';
            variableContent = right || '';
          }

          // Skip header row and empty rows
          if (!variableName || variableName === 'variable') return;

          // Backward-compat: handle the merged "variable hero_title hero_subtitle..." row
          if (
            variableName.startsWith('variable') &&
            variableName.includes('hero_title') &&
            variableName.includes('hero_background_images')
          ) {
            const urls = (variableContent.match(/https?:\/\/[^\s,"]+/g) || []).map(u => u.trim());
            if (urls.length) content['hero_background_images'] = urls.join(',');

            const textPart = variableContent
              .replace(/https?:\/\/[^\s,"]+/g, '')
              .replace(/^content\s*/i, '')
              .trim();

            const parts = (textPart.includes('|')
              ? textPart.split('|')
              : textPart.includes(',')
                ? textPart.split(',')
                : textPart.split(/\s{2,}/)
            ).map(s => s.trim()).filter(Boolean);

            if (parts[0]) content['hero_title'] = parts[0];
            if (parts[1]) content['hero_subtitle'] = parts[1];
            if (parts[2]) content['hero_description'] = parts.slice(2).join(' ');

            return;
          }

          // Regular row: variable in column A, content in column B
          content[variableName] = variableContent;
        });
        
        console.log('Parsed other content:', content);
        
        // Parse comma-separated values into arrays
        const parseCommaSeparated = (value: string) => 
          value.split(',').map(s => s.trim()).filter(Boolean);
        
        const heroTitles = parseCommaSeparated(content['hero_title'] || '');
        const heroSubtitles = parseCommaSeparated(content['hero_subtitle'] || '');
        const heroDescriptions = parseCommaSeparated(content['hero_description'] || '');
        const bgImages = parseCommaSeparated(content['hero_background_images'] || '')
          .filter(url => url.startsWith('http'));
        
        setData({
          hero_titles: heroTitles,
          hero_subtitles: heroSubtitles,
          hero_descriptions: heroDescriptions,
          hero_background_images: bgImages,
          in_mobile_max_special_visits: parseInt(content['in_mobile_max_special_visits']) || 5,
          in_desktop_max_special_visits: parseInt(content['in_desktop_max_special_visits']) || 6,
          in_mobile_max_gallery: parseInt(content['in_mobile_max_gallery']) || 5,
          in_desktop_max_gallery: parseInt(content['in_desktop_max_gallery']) || 5,
          in_mobile_max_reviews: parseInt(content['in_mobile_max_reviews']) || 5,
          in_desktop_max_reviews: parseInt(content['in_desktop_max_reviews']) || 5,
        });
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
