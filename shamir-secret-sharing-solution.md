# Hashira Placements Assignment - Shamir's Secret Sharing Solution

## Problem Understanding

This assignment implements **Shamir's Secret Sharing** algorithm, which uses polynomial interpolation to reconstruct a secret from distributed shares. The algorithm is based on the mathematical principle that:

- A polynomial of degree `d` requires exactly `d+1` points to be uniquely determined
- Given `k` points, we can find a polynomial of degree `k-1` that passes through all these points
- The secret is encoded as the constant term of the polynomial (value at x=0)

## Algorithm Steps

1. **Parse Input**: Extract `n` (total roots), `k` (minimum required), and root data
2. **Base Conversion**: Convert each value from its specified base to decimal  
3. **Point Extraction**: Create (x, y) coordinate pairs where x is the root key and y is the converted decimal value
4. **Polynomial Interpolation**: Use Lagrange interpolation to find the polynomial
5. **Secret Recovery**: Evaluate the polynomial at x=0 to get the constant term (secret)

## Implementation

### Complete Solution (Any Language Except Python)

```java
import java.util.*;
import java.math.BigInteger;
import java.io.*;
import com.google.gson.*;

public class ShamirSecretSharing {
    
    public static class Point {
        BigInteger x, y;
        Point(BigInteger x, BigInteger y) {
            this.x = x;
            this.y = y;
        }
    }
    
    // Convert from any base to decimal
    public static BigInteger convertToDecimal(String value, int base) {
        BigInteger result = BigInteger.ZERO;
        BigInteger baseBI = BigInteger.valueOf(base);
        
        for (int i = 0; i < value.length(); i++) {
            char digit = value.charAt(i);
            int digitValue;
            
            if (Character.isDigit(digit)) {
                digitValue = digit - '0';
            } else {
                digitValue = Character.toUpperCase(digit) - 'A' + 10;
            }
            
            if (digitValue >= base) {
                throw new IllegalArgumentException("Invalid digit for base: " + digit);
            }
            
            result = result.multiply(baseBI).add(BigInteger.valueOf(digitValue));
        }
        
        return result;
    }
    
    // Lagrange interpolation to find polynomial value at x=0
    public static BigInteger lagrangeInterpolation(List<Point> points) {
        BigInteger result = BigInteger.ZERO;
        int n = points.size();
        
        for (int i = 0; i < n; i++) {
            BigInteger term = points.get(i).y;
            
            // Calculate Lagrange basis polynomial Li(0)
            for (int j = 0; j < n; j++) {
                if (i != j) {
                    BigInteger xi = points.get(i).x;
                    BigInteger xj = points.get(j).x;
                    
                    // term *= (0 - xj) / (xi - xj) = -xj / (xi - xj)
                    term = term.multiply(xj.negate()).divide(xi.subtract(xj));
                }
            }
            
            result = result.add(term);
        }
        
        return result;
    }
    
    public static void main(String[] args) {
        try {
            // Read JSON input
            Scanner scanner = new Scanner(System.in);
            StringBuilder jsonInput = new StringBuilder();
            while (scanner.hasNextLine()) {
                jsonInput.append(scanner.nextLine());
            }
            
            // Parse JSON
            Gson gson = new Gson();
            JsonObject data = gson.fromJson(jsonInput.toString(), JsonObject.class);
            
            int n = data.getAsJsonObject("keys").get("n").getAsInt();
            int k = data.getAsJsonObject("keys").get("k").getAsInt();
            
            System.out.println("n = " + n + ", k = " + k);
            System.out.println("Polynomial degree = " + (k-1));
            
            // Extract points
            List<Point> points = new ArrayList<>();
            
            for (Map.Entry<String, JsonElement> entry : data.entrySet()) {
                String key = entry.getKey();
                if (!key.equals("keys")) {
                    int x = Integer.parseInt(key);
                    JsonObject pointData = entry.getValue().getAsJsonObject();
                    
                    int base = pointData.get("base").getAsInt();
                    String value = pointData.get("value").getAsString();
                    
                    BigInteger y = convertToDecimal(value, base);
                    points.add(new Point(BigInteger.valueOf(x), y));
                    
                    System.out.println("Point " + x + ": " + value + " (base " + base + ") = " + y);
                }
            }
            
            // Sort points and take first k
            points.sort((p1, p2) -> p1.x.compareTo(p2.x));
            List<Point> interpolationPoints = points.subList(0, Math.min(k, points.size()));
            
            System.out.println("\nUsing points for interpolation:");
            for (Point p : interpolationPoints) {
                System.out.println("(" + p.x + ", " + p.y + ")");
            }
            
            // Find secret
            BigInteger secret = lagrangeInterpolation(interpolationPoints);
            System.out.println("\nSecret (constant term): " + secret);
            
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
```

### Alternative C++ Solution

```cpp
#include <iostream>
#include <vector>
#include <string>
#include <map>
#include <algorithm>
#include <cmath>

using namespace std;

// Convert string from given base to decimal
long long convertToDecimal(const string& value, int base) {
    long long result = 0;
    long long power = 1;
    
    for (int i = value.length() - 1; i >= 0; i--) {
        char digit = value[i];
        int digitValue;
        
        if (isdigit(digit)) {
            digitValue = digit - '0';
        } else {
            digitValue = toupper(digit) - 'A' + 10;
        }
        
        if (digitValue >= base) {
            throw invalid_argument("Invalid digit for base");
        }
        
        result += digitValue * power;
        power *= base;
    }
    
    return result;
}

// Lagrange interpolation at x=0
double lagrangeInterpolation(const vector<pair<int, long long>>& points) {
    double result = 0.0;
    int n = points.size();
    
    for (int i = 0; i < n; i++) {
        double term = points[i].second;
        
        for (int j = 0; j < n; j++) {
            if (i != j) {
                int xi = points[i].first;
                int xj = points[j].first;
                term = term * (-xj) / (double)(xi - xj);
            }
        }
        
        result += term;
    }
    
    return result;
}

int main() {
    // This is a simplified version - in practice you'd parse JSON
    // For now, manually input the test case data
    
    cout << "Shamir's Secret Sharing Solution" << endl;
    cout << "Enter n, k: ";
    int n, k;
    cin >> n >> k;
    
    vector<pair<int, long long>> points;
    
    cout << "Enter " << n << " points (x base value):" << endl;
    for (int i = 0; i < n; i++) {
        int x, base;
        string value;
        cin >> x >> base >> value;
        
        long long y = convertToDecimal(value, base);
        points.push_back({x, y});
        
        cout << "Point " << x << ": " << value << " (base " << base << ") = " << y << endl;
    }
    
    // Sort and take first k points
    sort(points.begin(), points.end());
    points.resize(k);
    
    cout << "\nUsing " << k << " points for interpolation:" << endl;
    for (const auto& p : points) {
        cout << "(" << p.first << ", " << p.second << ")" << endl;
    }
    
    double secret = lagrangeInterpolation(points);
    cout << "\nSecret: " << (long long)round(secret) << endl;
    
    return 0;
}
```

## Test Case Results

### Sample Test Case 1
```json
{
    "keys": {"n": 4, "k": 3},
    "1": {"base": "10", "value": "4"},
    "2": {"base": "2", "value": "111"},
    "3": {"base": "10", "value": "12"},
    "6": {"base": "4", "value": "213"}
}
```

**Points after conversion:**
- (1, 4) from "4" base 10
- (2, 7) from "111" base 2  
- (3, 12) from "12" base 10
- (6, 39) from "213" base 4

**Using points (1,4), (2,7), (3,12) for interpolation:**

**Manual verification:**
Polynomial: f(x) = ax² + bx + c
- f(1) = a + b + c = 4
- f(2) = 4a + 2b + c = 7  
- f(3) = 9a + 3b + c = 12

Solving: a = 1, b = 0, c = 3
So f(x) = x² + 3, and f(0) = 3

**Result: Secret = 3**

### Sample Test Case 2
The second test case appears to have formatting issues with some values in scientific notation. A properly formatted version would have valid base representations for all values.

## Key Concepts

1. **Polynomial Interpolation**: Given k points, there's exactly one polynomial of degree k-1 that passes through all of them
2. **Lagrange Formula**: Efficient method to evaluate this polynomial at any point without finding coefficients
3. **Secret Sharing**: The constant term (value at x=0) represents the shared secret
4. **Base Conversion**: Converting numbers from various bases to decimal for computation

## Implementation Notes

- Use high-precision arithmetic for large numbers
- Handle bases up to 36 (0-9, A-Z)
- Sort points by x-coordinate for consistency
- Only need k points for reconstruction (threshold property)
- Verify input data format to avoid scientific notation issues

This solution demonstrates the elegant mathematical foundation of modern cryptographic secret sharing schemes.
